const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;

const services = [
  {
    name: 'MAIN BACKEND',
    color: '\x1b[32m', // Green
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.join(rootDir, 'backend-main')
  },
  {
    name: 'AI ENGINE',
    color: '\x1b[35m', // Magenta
    cmd: 'python',
    args: ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
    cwd: path.join(rootDir, 'backend-ai')
  },
  {
    name: 'FRONTEND WEB',
    color: '\x1b[36m', // Cyan
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.join(rootDir, 'frontend-web')
  }
];

const resetColor = '\x1b[0m';
console.log('\x1b[1m\x1b[34m============================================================\x1b[0m');
console.log('\x1b[1m\x1b[34m🏥 SmartPHR: Starting All Microservices Concurrently...\x1b[0m');
console.log('   - Backend Main: http://localhost:5001');
console.log('   - AI Engine:    http://localhost:8000');
console.log('   - Frontend Web: http://localhost:5173');
console.log('\x1b[1m\x1b[34m============================================================\x1b[0m\n');

const runningProcesses = [];

services.forEach(svc => {
  const prefix = `${svc.color}[${svc.name}]${resetColor} `;
  console.log(`${prefix}Starting in ${svc.cwd}...`);

  const proc = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' }
  });

  proc.stdout.on('data', data => {
    process.stdout.write(prefix + data.toString().replace(/\n(.)/g, '\n' + prefix + '$1'));
  });

  proc.stderr.on('data', data => {
    process.stderr.write(prefix + data.toString().replace(/\n(.)/g, '\n' + prefix + '$1'));
  });

  proc.on('close', code => {
    console.log(`${prefix}Exited with code ${code}`);
  });

  proc.on('error', err => {
    console.error(`${prefix}Failed to start:`, err.message);
  });

  runningProcesses.push(proc);
});

const cleanup = () => {
  console.log('\n\x1b[33m🛑 Gracefully shutting down all services...\x1b[0m');
  runningProcesses.forEach(proc => {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid, '/f', '/t']);
      } else {
        proc.kill('SIGINT');
      }
    } catch (e) {}
  });
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
