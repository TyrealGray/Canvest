#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const fastify = require('fastify')({ bodyLimit: 1024 * 1024 * 50 });

const wsHandle = (conn) => {
	conn.socket.on('message', (message) => {
		if (typeof message === 'string') {
			//console.log(JSON.parse(message));
		}
	});
};

fastify.register(require('fastify-cors'), { origin: true });

fastify.register(require('fastify-websocket'), {
	handle: wsHandle,
	options: {
		maxPayload: 1024 * 1024 * 50, // we set the maximum allowed messages size to 1 MiB (1024 bytes * 1024 bytes)
		path: '/', // we accept only connections matching this path e.g.: ws://localhost:3000/fastify
	},
});

fastify.route({
	method: 'POST',
	url: '/shot',
	handler: async (req, reply) => {
		try {
			const fileName = req.body.name;
			const imageDataURL = req.body.dataURL;
			const imageDataBase64 = imageDataURL.replace(
				/^data:image\/png;base64,/,
				'',
			);

			const imagePath = path.join(
				process.cwd(),
				'canvest',
				'autoShot',
				`${fileName}.png`,
			);
			let pass = false,
				cachedImageBuffer = null;

			if (!fs.existsSync(imagePath)) {
				fs.ensureFileSync(imagePath);
				fs.writeFileSync(imagePath, imageDataBase64, 'base64');
				pass = true;
			} else {
				const buffer = Buffer.from(imageDataBase64, 'base64');

				const snapShot = PNG.sync.read(fs.readFileSync(imagePath));

				const { width, height } = snapShot;

				const diffImage = new PNG({ width, height });

				const diff = pixelmatch(
					PNG.sync.read(buffer).data,
					snapShot.data,
					diffImage.data,
					width,
					height,
					{ threshold: 0.05 },
				);

				cachedImageBuffer = PNG.sync.write(diffImage);

				pass = diff === 0;
			}

			const dataURL = cachedImageBuffer
				? cachedImageBuffer.toString('base64')
				: null;

			reply.type('application/json').code(200);
			return { pass, dataURL };
		} catch (e) {
			console.log(e);
			reply.type('application/json').code(500);
			return { pass: false, dataURL: null };
		}
	},
});

fastify.listen(argv.port? argv.port: 45670, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	console.log('｢cds｣ starting');
});