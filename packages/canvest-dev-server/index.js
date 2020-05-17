#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const fastify = require('fastify')();

let ciOutputPath = '';

if (argv.ci) {
	ciOutputPath = path.join(process.cwd(), argv.ci, 'canvest-test-result');
	fs.ensureDirSync(ciOutputPath);
}

fastify.register(require('fastify-cors'), { origin: true });

fastify.register(require('fastify-ws'));

fastify.ready((err) => {
	if (err) throw err;

	console.log('｢cds｣ starting');

	fastify.ws.on('connection', (socket) => {
		if (!argv.ci) {
			return;
		}

		let unfinishedTest = 0;
		let testCloseTimer = null;
		let testFailed = 0;

		socket.on('message', (message) => {
			if (typeof message === 'string') {
				const testInfo = JSON.parse(message);

				if (testInfo.type === 'diff') {
					testFailed++;
					const dataURL = testInfo.data.replace(
						/^data:image\/png;base64,/,
						'',
					);
					const outputImagePath = path.join(
						ciOutputPath,
						`test-${testFailed}.diff.png`,
					);
					fs.writeFile(outputImagePath, dataURL, 'base64');
				}

				if (
					testInfo.type === 'info' &&
					testInfo.data === 'testFailed'
				) {
					testFailed++;
				}

				if (testInfo.type === 'event' && testInfo.data === 'testInit') {
					unfinishedTest = 1;
					clearTimeout(testCloseTimer);
					testCloseTimer = null;
				}

				if (
					testInfo.type === 'event' &&
					testInfo.data === 'suiteFinished'
				) {
					unfinishedTest = 0;
					clearTimeout(testCloseTimer);

					testCloseTimer = setTimeout(() => {
						if (!unfinishedTest && !testFailed) {
							process.exit(0);
						} else {
							console.error(
								`${testFailed} test${
									testFailed > 1 ? 's' : ''
								} failed, diff results output at ${argv.ci}`,
							);
							process.exit(1);
						}
					}, 5000);
				}

				if (testInfo.type === 'event' && testInfo.data === 'suiteRun') {
					unfinishedTest = 1;
				}
			}
		});

		socket.on('close', () => console.log('Client disconnected.'));
	});
});

fastify.route({
	method: 'POST',
	url: '/shot',
	handler: async (req, reply) => {
		const fileName = req.body.name;
		try {
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

			if (!pass && argv.ci) {
				const outputImagePath = path.join(
					ciOutputPath,
					`${fileName}.diff.png`,
				);
				fs.writeFileSync(outputImagePath, dataURL, 'base64');
			}

			reply.type('application/json').code(200);
			return { pass, dataURL };
		} catch (e) {
			console.log(e);
			reply.type('application/json').code(500);

			if (argv.ci) {
				fs.ensureFileSync(
					path.join(ciOutputPath, `${fileName}.diff.failed`),
				);
			}

			return { pass: false, dataURL: null };
		}
	},
});

fastify.listen(argv.port ? argv.port : 45670);