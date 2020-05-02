#!/usr/bin/env node
const argv = require('yargs').argv;
const processRunNPM = require('./processUtil').processRunNPM;

(async () => {
	if (argv.ts) {
		await processRunNPM(['run','tsc', './canvest/*.ts'], process.cwd());
	}
	await processRunNPM(['run','canvest'], process.cwd());
})();