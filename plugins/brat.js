const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const { tmpdir } = require("os");
const Crypto = require("crypto");
const webp = require("node-webpmux");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSticker(text, attempt = 1) {
  try {
    const response = await axios.get("https://kepolu-brat.hf.space/brat", {
      params: { q: text },
      responseType: "arraybuffer",
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429 && attempt <= 3) {
      const retryAfter = error.response.headers["retry-after"] || 5;
      await delay(retryAfter * 1000);
      return fetchSticker(text, attempt + 1);
    }
    throw error;
  }
}

const handler = async (msg, { conn, args }) => {
  const text = args.join(" ");
  if (!text) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: "❇️ Por favor ingresa el texto para hacer un sticker.",
    }, { quoted: msg });
  }

  let tmpIn, tmpOut, tmpFinal;
  
  try {
    const buffer = await fetchSticker(text);
    tmpIn = path.join(tmpdir(), `brat-${Date.now()}.png`);
    tmpOut = path.join(tmpdir(), `brat-${Date.now()}.webp`);
    tmpFinal = path.join(tmpdir(), `brat-final-${Date.now()}.webp`);

    // Convertir imagen a webp
    await sharp(buffer)
      .resize(512, 512, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(tmpIn);

    await sharp(tmpIn)
      .webp({ quality: 80 })
      .toFile(tmpOut);

    // Meter EXIF (packname y author)
    const metadata = {
      packname: "M-STER ULTRA BOT",
      author: "M-ster ultra bot",
    };

    const finalSticker = await addExif(fs.readFileSync(tmpOut), metadata);
    fs.writeFileSync(tmpFinal, finalSticker);

    await conn.sendMessage(msg.key.remoteJid, {
      sticker: { url: tmpFinal },
    }, { quoted: msg });

    // No quites créditos weon
    await conn.sendMessage(msg.key.remoteJid, {
      text: "> ✨ Powered by: *ghostdev.js*",
    }, { quoted: msg });

  } catch (error) {
    console.error("❌ Error en brat:", error);
    await conn.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Ocurrió un error al generar el sticker.",
    }, { quoted: msg });
  } finally {
    // Limpiar archivos temporales
    try {
      if (tmpIn && fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
      if (tmpOut && fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
      if (tmpFinal && fs.existsSync(tmpFinal)) fs.unlinkSync(tmpFinal);
    } catch (cleanupError) {
      console.error("Error limpiando archivos:", cleanupError);
    }
  }
};

handler.command = ["brat"];
module.exports = handler;

/* === FUNCIONES PARA AÑADIR EXIF === */
async function addExif(webpBuffer, metadata) {
  const tmpIn = path.join(tmpdir(), randomFileName("webp"));
  const tmpOut = path.join(tmpdir(), randomFileName("webp"));
  fs.writeFileSync(tmpIn, webpBuffer);

  const json = {
    "sticker-pack-id": "azura-ultra&cortana",
    "sticker-pack-name": metadata.packname,
    "sticker-pack-publisher": metadata.author,
    emojis: metadata.categories || [""],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00,
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  const img = new webp.Image();
  await img.load(tmpIn);
  img.exif = exif;
  await img.save(tmpOut);
  
  const result = fs.readFileSync(tmpOut);
  
  // Limpiar archivos temporales de addExif
  try {
    if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  } catch (e) {}
  
  return result;
}

function randomFileName(ext) {
  return `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`;
}
