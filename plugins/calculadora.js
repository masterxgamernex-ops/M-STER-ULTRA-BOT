const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  await conn.sendPresenceUpdate('composing', chatId);
  await new Promise(resolve => setTimeout(resolve, 1500));
  await conn.sendPresenceUpdate('paused', chatId);
  
  if (!text) {
    return conn.sendMessage(chatId, {
      text: `🔢 *CALCULADORA AVANZADA*

*Uso:* .calc <expresión>

*Operaciones soportadas:*
➕ *Básicas:* + - * / ( )
🔢 *Potencias:* 2^8, 3**4
📐 *Raíces:* √16, √(25)
🎲 *Aleatorio:* random(1, 10)
📏 *Funciones:* sin(30), cos(45), log(100)
🎯 *Constantes:* π, e

*Ejemplos:*
.calc 5 + 3 * 2
.calc √(9 + 16)
.calc sin(45) + cos(45)
.calc 2^10 + random(1, 100)\n\n> Powered by: *ghostdev.js*`
    }, { quoted: msg });
  }

  await conn.sendPresenceUpdate('composing', chatId);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await conn.sendPresenceUpdate('paused', chatId);

  try {
    // 🔧 PREPROCESAR EXPRESIÓN
    let expression = text.trim()
      .replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/√(\w+)/g, 'Math.sqrt($1)')
      .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
      .replace(/\^/g, '**')
      .replace(/π/gi, 'Math.PI')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/sin\(/gi, 'Math.sin(Math.PI/180*')
      .replace(/cos\(/gi, 'Math.cos(Math.PI/180*')
      .replace(/tan\(/gi, 'Math.tan(Math.PI/180*')
      .replace(/log\(/gi, 'Math.log10(')
      .replace(/ln\(/gi, 'Math.log(')
      .replace(/random\((\d+),(\d+)\)/gi, 'Math.floor(Math.random() * ($2 - $1 + 1)) + $1');

    // 🚨 VALIDACIÓN DE SEGURIDAD MEJORADA
    const safeRegex = /^[0-9+\-*/().\sMathPIEsincostanlogsqrtrandomfloor]+$/;
    if (!safeRegex.test(expression)) {
      return conn.sendMessage(chatId, {
        text: "❌ *Expresión no permitida por seguridad*"
      }, { quoted: msg });
    }

    // 🧮 EVALUAR
    const result = eval(expression);
    const roundedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));

    await conn.sendMessage(chatId, {
      text: `🔢 *RESULTADO MATEMÁTICO*

📝 *Expresión:* ${text}
✅ *Resultado:* ${roundedResult}
📊 *Tipo:* ${typeof result}

${expression !== text ? `🔧 *Procesado:* ${expression}` : ''}`
    }, { quoted: msg });

  } catch (error) {
    await conn.sendMessage(chatId, {
      text: `❌ *Error en el cálculo*

📝 *Expresión:* ${text}
💥 *Error:* ${error.message}

💡 *Posibles causas:*
- Sintaxis incorrecta
- Paréntesis no balanceados
- Función no soportada`
    }, { quoted: msg });
  }
};

handler.command = ["calc", "math", "calcular"];
module.exports = handler;
