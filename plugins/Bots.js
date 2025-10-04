const handler = async (msg, { conn }) => {
  const fs = require("fs");
  const path = require("path");

  try {
    const subbotsFolder = "./subbots";
    const prefixPath = path.resolve("prefixes.json");

    // Verificar si existe la carpeta de subbots
    if (!fs.existsSync(subbotsFolder)) {
      return await conn.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ No hay subbots conectados actualmente." },
        { quoted: msg }
      );
    }

    // Leer subdirectorios con creds.json
    const subDirs = fs.readdirSync(subbotsFolder).filter(dir => {
      const credsPath = path.join(subbotsFolder, dir, "creds.json");
      return fs.existsSync(credsPath);
    });

    if (subDirs.length === 0) {
      return await conn.sendMessage(
        msg.key.remoteJid,
        { text: "⚠️ No hay subbots conectados actualmente." },
        { quoted: msg }
      );
    }

    // Leer prefixes
    let dataPrefijos = {};
    if (fs.existsSync(prefixPath)) {
      dataPrefijos = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
    }

    const total = subDirs.length;
    const maxSubbots = 30;
    const disponibles = maxSubbots - total;

    // Generar lista de subbots
    const lista = subDirs.map((dir, i) => {
      const jid = dir.replace(/[^0-9]/g, ""); // Extraer solo números
      const fullJid = `${jid}@s.whatsapp.net`;
      const prefijo = dataPrefijos[fullJid] || ".";
      
      // Censurar número: +52123456789 → +521*****789
      const sensurado = jid.length >= 5 
        ? `+${jid.slice(0, 3)}*****${jid.slice(-3)}`
        : `+${jid}`;

      return `╭➤ *Subbot ${i + 1}*
│ 📱 Número: ${sensurado}
│ ⚡ Prefijo: *${prefijo}*
╰───────────────`;
    });

    const menu = `╭━〔 *M-STER ULTRA BOT* 〕━⬣
│ 🤖 Total conectados: *${total}/${maxSubbots}*
│ 🟢 Sesiones libres: *${disponibles}*
╰━━━━━━━━━━━━⬣

${lista.join("\n\n")}

💡 *Nota:* Los números están censurados por seguridad.`;

    await conn.sendMessage(
      msg.key.remoteJid,
      { text: menu },
      { quoted: msg }
    );

  } catch (error) {
    console.error("Error en comando bots:", error);
    await conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Error al obtener la lista de subbots." },
      { quoted: msg }
    );
  }
};

handler.command = ['bots', 'subbots'];
handler.tags = ['owner'];
handler.help = ['bots'];
module.exports = handler;
