#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScirpt = require('./src/createScirpt');

(async () => {

	const cachePort = (argv.cachePort)? argv.cachePort : 45670;

	createScirpt.createInitScript(cachePort);

	const cmd = ['--kill-others'];

	cmd.push(`\"node ./node_modules/@canvest/canvest-dev-server/index.js --port ${cachePort}\"`);

	const wdsRunCMD = `node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config ${path.join(__dirname,'./canvest.config.js')}`;
	const wdsConfigCMD = `${(!argv.debug) ? '--quiet' : ''} ${(argv.pagePort) ? `--port ${argv.pagePort}`: ''}`;

	cmd.push(`\" ${wdsRunCMD} ${wdsConfigCMD} \"`);

	await processUtil.processRun('concurrently',cmd,process.cwd());

})();
