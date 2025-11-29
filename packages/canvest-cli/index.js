#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScript = require('./src/createScirpt');

(async () => {
  const cachePort = argv.cachePort ? argv.cachePort : 45670;

  createScript.createInitScript(cachePort, argv.ts);

  const cmd = ['--kill-others'];

  const cdsConfigCMD = `--port ${cachePort} ${argv.ci ? `--ci ${argv.ci}` : ''}`;
  cmd.push(
    `"node ./node_modules/@canvest/canvest-dev-server/index.js ${cdsConfigCMD}"`
  );

  const viteConfig = path.join(__dirname, './canvest.config.mjs');

  const viteEnv = {
    ...process.env,
    VITE_DEBUG: argv.debug ? 'true' : 'false',
    VITE_PAGE_PORT: argv.pagePort || '',
    VITE_CACHE_PORT: String(cachePort),
  };

  const viteCmd = `npx vite --config "${viteConfig}" --open`;

  cmd.push(`"${viteCmd}"`);

  try {
    await processUtil.processRunConcurrently(cmd, process.cwd(), viteEnv);
  } catch (e) {
    console.error(e);
  }
})();
