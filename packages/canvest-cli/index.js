#!/usr/bin/env node
const argv = require('yargs').argv;
const processRunNode = require('./src/processUtil').processRunNode;

(async () => {
	const cmd = ['./node_modules/@canvest/canvest-dev-server/bin/canvest-dev-server.js'];
	if (!argv.debug) {
		cmd.push('--quiet');
	}

	await processRunNode(
		cmd,
		process.cwd(),
	);
})();
