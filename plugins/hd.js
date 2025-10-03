const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // 1) Verificar que sea respuesta a una imagen
  const quotedCtx = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = quotedCtx?.quotedMessage;
  if (!quoted?.imageMessage) {
    return conn.sendMessage(chatId, {
      text: "✳️ *Responde a una imagen para mejorarla.*"
    }, { quoted: msg });
  }

  // 2) Reacción de procesando
  await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

  try {
    // 3) Descargar imagen a tmp
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
    const tmpFile = path.join(tmpDir, `${Date.now()}_hd.jpg`);
    const ws = fs.createWriteStream(tmpFile);
    for await (const chunk of stream) ws.write(chunk);
    ws.end();
    await new Promise(resolve => ws.on("finish", resolve));

    // 4) Subir a CDN
    const uploadForm = new FormData();
    uploadForm.append("file", fs.createReadStream(tmpFile));
    const up = await axios.post("https://cdn.russellxz.click/upload.php", uploadForm, {
      headers: uploadForm.getHeaders()
    });
    fs.unlinkSync(tmpFile);

    if (!up.data?.url) throw new Error("No se obtuvo URL al subir al CDN.");
    const imageUrl = up.data.url;

    // 5) Llamar a API de Remini
    const API_KEY = "russellxz";
    const REMINI_URL = "https://api.neoxr.eu/api/remini";
    const rem = await axios.get(
      `${REMINI_URL}?image=${encodeURIComponent(imageUrl)}&apikey=${API_KEY}`
    );

    if (!rem.data?.status || !rem.data.data?.url) {
      throw new Error("La API no devolvió URL de imagen mejorada.");
    }

    // 6) Enviar imagen mejorada
    await conn.sendMessage(chatId, {
      image: { url: rem.data.data.url },
      caption: "✅ *Imágen mejorada exitosamente*\n\n> HD by: *M-ster.js*"
    }, { quoted: msg });

    await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

  } catch (e) {
    console.error("❌ Error en comando .hd:", e);
    await conn.sendMessage(chatId, {
      text: `❌ *Error:* ${e.message}`
    }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
  }
};

handler.command = ["hd"];
handler.help = ["hd"];
handler.tags = ["tools"];

module.exports = handler;
