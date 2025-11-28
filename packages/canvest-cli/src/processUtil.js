const { spawn } = require('child_process');

function processRun(prefix, cmd, cwd, env = process.env) {
  return new Promise((resolve, reject) => {
    const logger = spawn(prefix, cmd, {
      cwd,
      stdio: 'inherit',
      env,
      shell: false,
    });

    logger.on('error', (err) => reject(err));
    logger.on('close', (code) => resolve(code));
  });
}

function processRunConcurrently(cmdArray, cwd, env = process.env) {
  const isWin = /^win/.test(process.platform);

  let cmdHead;
  let cmdArgs;

  if (isWin) {
    cmdHead = 'cmd.exe';
    cmdArgs = ['/c', 'npx', 'concurrently', ...cmdArray];
  } else {
    cmdHead = 'npx';
    cmdArgs = ['concurrently', ...cmdArray];
  }

  return processRun(cmdHead, cmdArgs, cwd, env);
}

async function processRunNPM(cmd, cwd, env = process.env) {
  const prefix = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
  return processRun(prefix, cmd, cwd, env);
}

exports.processRun = processRun;
exports.processRunConcurrently = processRunConcurrently;
exports.processRunNPM = processRunNPM;