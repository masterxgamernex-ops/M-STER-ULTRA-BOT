const handler = async (msg, { conn, text }) => {
    const chatId = msg.key.remoteJid;
    
    // Verificar que es un grupo
    if (!chatId.endsWith('@g.us')) {
        return conn.sendMessage(chatId, {
            text: '❌ Este comando solo funciona en grupos.'
        }, { quoted: msg });
    }

    // Inicializar db si no existe
    if (!global.db) global.db = {};
    if (!global.db.topCooldown) global.db.topCooldown = {};

    // Verificar cooldown (5 minutos = 300000 ms)
    const now = Date.now();
    if (global.db.topCooldown[chatId] && (now - global.db.topCooldown[chatId]) < 300000) {
        const tiempoRestante = Math.ceil((300000 - (now - global.db.topCooldown[chatId])) / 1000 / 60);
        return conn.sendMessage(chatId, {
            text: `⏰ El comando está en cooldown. Espera *${tiempoRestante} minuto(s)* para usar nuevamente.`
        }, { quoted: msg });
    }

    // Actualizar cooldown
    global.db.topCooldown[chatId] = now;

    // Obtener miembros del grupo
    const groupMetadata = await conn.groupMetadata(chatId);
    const participants = groupMetadata.participants;
    
    if (participants.length < 10) {
        return conn.sendMessage(chatId, {
            text: `❌ El grupo necesita al menos *10 miembros* para usar este comando. Actualmente hay *${participants.length}*.`
        }, { quoted: msg });
    }

    // Mezclar participantes aleatoriamente
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const seleccionados = shuffled.slice(0, 10);

    // Crear texto del top con menciones
    const tema = text || 'TOP ALEATORIO';
    let resultado = `🏆 *${tema.toUpperCase()}* 🏆\n\n`;
    
    // Preparar array de menciones
    const mentions = [];
    
    seleccionados.forEach((participant, index) => {
        const numero = index + 1;
        const emoji = getMedalEmoji(numero);
        const userJid = participant.id;
        
        // Agregar mención al texto
        resultado += `${emoji} *${numero}.* @${userJid.split('@')[0]}\n`;
        
        // Agregar a array de menciones
        mentions.push(userJid);
    });

    resultado += `\n📊 *Total de participantes:* ${participants.length}\n⏰ *Cooldown:* 5 minutos`;

    await conn.sendMessage(chatId, {
        text: resultado,
        mentions: mentions
    }, { quoted: msg });

    // Reacción de confirmación
    await conn.sendMessage(chatId, {
        react: { text: "✅", key: msg.key }
    });
};

// Función para obtener emojis de medallas
function getMedalEmoji(position) {
    switch(position) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        case 4: return '🔸';
        case 5: return '🔹';
        case 6: return '🔺';
        case 7: return '🔻';
        case 8: return '⭐';
        case 9: return '✨';
        case 10: return '💫';
        default: return '🔸';
    }
}

handler.command = ["top"];
module.exports = handler;
￼Enter
