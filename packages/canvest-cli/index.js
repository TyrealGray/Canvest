#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScirpt = require('./src/createScirpt');

(async () => {
	const cachePort = argv.cachePort ? argv.cachePort : 45670;

	createScirpt.createInitScript(cachePort, argv.ts);

	const cmd = ['--kill-others'];

	const cdsConfigCMD = `--port ${cachePort} ${
		argv.ci ? `--ci ${argv.ci}` : ''
		}`;

	cmd.push(
		`"node ./node_modules/@canvest/canvest-dev-server/index.js ${cdsConfigCMD}"`,
	);

	const wdsRunCMD = `node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config ${path.join(
		__dirname,
		'./canvest.config.js',
	)}`;

	const wdsConfigCMD = `${!argv.debug ? '--quiet' : ''} ${
		argv.pagePort ? `--port ${argv.pagePort}` : ''
		} ${argv.ts ? `--ts ${argv.ts}` : ''}`;

	cmd.push(`" ${wdsRunCMD} ${wdsConfigCMD} "`);

	const coverageCmd = [`./node_modules/nyc/bin/nyc.js report --reporter=html --temp-dir=${path.join(
		process.cwd(),
		'./coverage',
	)}`];

	try {
		await processUtil.processRunConcurrently(cmd, process.cwd());
		await processUtil.processRunNode(coverageCmd, process.cwd());
		console.log('Cavest done!');
	}catch (e) {
		console.log(e);
	}

})();
