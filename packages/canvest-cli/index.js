#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScirpt = require('./src/createScirpt');

(async () => {

	createScirpt.createInitScript();

	const cmd = ['./node_modules/webpack-dev-server/bin/webpack-dev-server.js'];

	cmd.push(...['--config',path.join(__dirname,'./canvest.config.js')]);

	if (!argv.debug) {
		cmd.push('--quiet');
	}

	await processUtil.processRunNode(
		cmd,
		process.cwd(),
	);
})();
