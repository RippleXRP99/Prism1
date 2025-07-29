const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PRISM Platform...\n');

const services = [
    {
        name: 'API Server',
        icon: '🔧',
        path: path.join(__dirname, 'apps', 'api'),
        port: 3004
    },
    {
        name: 'Consumer Frontend',
        icon: '🎬',
        path: path.join(__dirname, 'apps', 'consumer'),
        port: 3000
    },
    {
        name: 'Creator Studio',
        icon: '🎨',
        path: path.join(__dirname, 'apps', 'creator-studio'),
        port: 3001
    },
    {
        name: 'Admin Panel',
        icon: '🛡️',
        path: path.join(__dirname, 'apps', 'admin'),
        port: 3002
    }
];

const processes = [];

services.forEach((service, index) => {
    setTimeout(() => {
        console.log(`${service.icon} Starting ${service.name} on port ${service.port}...`);
        
        const process = spawn('node', ['index.js'], {
            cwd: service.path,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        process.stdout.on('data', (data) => {
            console.log(`[${service.name}] ${data.toString().trim()}`);
        });

        process.stderr.on('data', (data) => {
            console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
        });

        process.on('error', (error) => {
            console.error(`❌ Failed to start ${service.name}:`, error.message);
        });

        process.on('exit', (code) => {
            console.log(`🔚 ${service.name} exited with code ${code}`);
        });

        processes.push({ name: service.name, process });
        
    }, index * 2000); // Stagger startup by 2 seconds each
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down PRISM Platform...');
    
    processes.forEach(({ name, process }) => {
        console.log(`🔚 Stopping ${name}...`);
        process.kill('SIGTERM');
    });
    
    setTimeout(() => {
        console.log('✅ All services stopped.');
        process.exit(0);
    }, 3000);
});

console.log('\n✨ PRISM Platform starting...');
console.log('📱 Consumer Frontend: http://localhost:3000');
console.log('🎨 Creator Studio: http://localhost:3001');
console.log('🛡️ Admin Panel: http://localhost:3002');
console.log('🔧 API Server: http://localhost:3004');
console.log('\n🔥 Press Ctrl+C to stop all services\n');
