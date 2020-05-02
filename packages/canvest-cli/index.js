#!/usr/bin/env node
const argv = require('yargs').argv;
const processRunNode = require('./src/processUtil').processRunNode;
const processRunNPM = require('./src/processUtil').processRunNPM;

(async () => {
	if (argv.ts) {
		await processRunNPM(['run','tsc', './canvest/*.ts'], process.cwd());
		console.log('convert to js testing files ready.')
	}
	await processRunNode(['./node_modules/@canvest/canvest-dev-server/bin/canvest-dev-server.js'], process.cwd());
})();