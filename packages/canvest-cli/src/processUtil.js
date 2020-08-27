const spawn = require('child_process').spawn;

function processRun(prefix,cmd,cwd) {

	return new Promise((resolve, reject) => {

		const logger = spawn(prefix, cmd, {
			cwd: cwd,
			stdio: 'inherit',
		});

		logger.on('message',  (data) => {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(data);
		});

		logger.on('error',  (err) => {
			reject(err);
		});
		logger.on('close',  (code) =>{
			resolve(code);
		});
	});
}

function processRunConcurrently(cmd, cwd){

	let cmdHead = /^win/.test(process.platform) ? 'powershell.exe' : 'concurrently';
	let cmdArray = cmd;
	if(/^win/.test(process.platform)){
		cmdArray = ['concurrently',...cmdArray];
	}

	return processRun(cmdHead, cmdArray,cwd);
}

async function processRunNode(cmd, cwd){

	let cmdHead = /^win/.test(process.platform) ? 'powershell.exe' : 'node';
	let cmdArray = cmd;
	if(/^win/.test(process.platform)){
		cmdArray = ['node',...cmdArray];
	}

	return processRun(cmdHead,cmdArray, cwd);
}

async function processRunNPM(cmd, cwd){
	const prefix = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

	return processRun(prefix,cmd,cwd);
}

exports.processRun = processRun;

exports.processRunConcurrently = processRunConcurrently;

exports.processRunNPM = processRunNPM;

exports.processRunNode = processRunNode;
