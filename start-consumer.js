const { spawn } = require('child_process');
const path = require('path');

console.log('🎬 Starting PRISM Consumer Frontend...');

const consumerPath = path.join(__dirname, 'apps', 'consumer');
const consumerProcess = spawn('node', ['index.js'], {
    cwd: consumerPath,
    stdio: 'inherit'
});

consumerProcess.on('error', (error) => {
    console.error('❌ Failed to start Consumer Frontend:', error);
});

consumerProcess.on('exit', (code) => {
    console.log(`🔚 Consumer Frontend exited with code ${code}`);
});

console.log('📁 Consumer Frontend PID:', consumerProcess.pid);
