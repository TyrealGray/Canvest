#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScirpt = require('./src/createScirpt');

(async () => {

	createScirpt.createInitScript();

	const cmd = ['--kill-others'];

	cmd.push(`\"node ./node_modules/@canvest/canvest-dev-server/index.js\"`);

	cmd.push(`\"node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config ${path.join(__dirname,'./canvest.config.js')} ${(!argv.debug)? '--quiet':''}\"`);

	await processUtil.processRun('concurrently',cmd,process.cwd());

})();
