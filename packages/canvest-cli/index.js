#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScript = require('./src/createScirpt');

(async () => {
  const cachePort = argv.cachePort ? argv.cachePort : 45670;

  // 1. Generate run.js before starting servers
  createScript.createInitScript(cachePort, argv.ts);

  const cmd = ['--kill-others'];

  // 2. Canvest Dev Server
  const cdsConfigCMD = `--port ${cachePort} ${argv.ci ? `--ci ${argv.ci}` : ''}`;
  cmd.push(
    `"node ./node_modules/@canvest/canvest-dev-server/index.js ${cdsConfigCMD}"`
  );

  // 3. Vite Dev Server (replacement for webpack)
  const vitePkg = require("vite/package.json");
  const viteBin = require.resolve(path.join("vite", vitePkg.bin.vite));
  const viteConfig = path.join(__dirname, './canvest.config.js');

  // Instead of unsupported `--env`, pass variables via process.env
  const viteEnv = {
    ...process.env,
    VITE_DEBUG: argv.debug ? 'true' : 'false',
    VITE_PAGE_PORT: argv.pagePort || '',
    VITE_CACHE_PORT: String(cachePort),
  };

  const viteCmd = `node "${viteBin}" --config "${viteConfig}" --open`;

  // 4. Instead of adding env vars inline (hard on Windows), inject them in processUtil
  cmd.push(`"${viteCmd}"`);

  try {
    await processUtil.processRunConcurrently(cmd, process.cwd(), viteEnv);
  } catch (e) {
    console.error(e);
  }
})();
