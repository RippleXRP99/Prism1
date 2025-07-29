const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PRISM API Server...');

const apiPath = path.join(__dirname, 'apps', 'api');
const apiProcess = spawn('node', ['index.js'], {
    cwd: apiPath,
    stdio: 'inherit'
});

apiProcess.on('error', (error) => {
    console.error('❌ Failed to start API server:', error);
});

apiProcess.on('exit', (code) => {
    console.log(`🔚 API server exited with code ${code}`);
});

console.log('📁 API Server PID:', apiProcess.pid);
