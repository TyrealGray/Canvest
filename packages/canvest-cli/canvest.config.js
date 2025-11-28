const path = require('path');
const fs = require('fs');
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	const cachePort = env.VITE_CACHE_PORT;
	const isDebug = env.VITE_DEBUG === 'true';

	console.log('Vite loaded with:', { cachePort, isDebug });

	return {
		root: path.join(__dirname),
		server: {
			fs: {
				allow: [
					process.cwd(),
					__dirname
				]
			},
			port: env.VITE_PAGE_PORT ? parseInt(env.VITE_PAGE_PORT) : 5173,
			open: true,
			logLevel: isDebug ? 'info' : 'error',
		},
		plugins: [
			{
				name: 'config-public-assets',
				configureServer(server) {
					const assetsPath = path.resolve(process.cwd(), 'public');

					if (fs.existsSync(assetsPath)) {
						server.middlewares.use('/', (req, res, next) => {
							const filePath = path.join(assetsPath, req.url);
							if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
								res.setHeader('Content-Type', 'application/octet-stream');
								fs.createReadStream(filePath).pipe(res);
							} else {
								next();
							}
						});
					}
				}
			}
		],
	};
});