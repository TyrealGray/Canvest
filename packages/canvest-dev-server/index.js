#!/usr/bin/env node
const NYC = require('nyc');
const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const fastify = require('fastify')();

let ciOutputPath = '';

if (argv.ci) {
	ciOutputPath = path.join(process.cwd(), `${argv.ci}` === 'true' ? 'canvest' : argv.ci, 'canvest-test-result');
	fs.ensureDirSync(ciOutputPath);
	fs.emptyDirSync(ciOutputPath);
}

fastify.register(require('fastify-cors'), { origin: true });

fastify.register(require('fastify-ws'));

fastify.ready((err) => {
	if (err) {
		throw err;
	}

	console.log('｢cds｣ starting');

	fastify.ws.on('connection', (socket) => {

		let unfinishedTest = 0;
		let testCloseTimer = null;
		let testFailed = 0;
		let testStart = false;

		socket.on('message', (message) => {
			if (typeof message === 'string') {
				const testInfo = JSON.parse(message);

				if (
					testInfo.type === 'coverage'
				) {
					createCoverageJson(testInfo.data);
				}


				if (testInfo.type === 'diff') {
					testFailed++;

					if (argv.ci) {
						const createResultInFolder = (data, fileName) => {
							const dataURL = data.replace(
								/^data:image\/png;base64,/,
								'',
							);
							const outputImagePath = path.join(
								ciOutputPath,
								fileName,
							);
							fs.writeFile(outputImagePath, dataURL, 'base64');
						};

						const { data, a, b } = testInfo;

						createResultInFolder(data, `test-${testFailed}.diff.png`);

						createResultInFolder(a, `test-${testFailed}.snapshot.png`);

						createResultInFolder(b, `test-${testFailed}.comparing.png`);
					}
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

					setTimeout(() => {
						if (testStart) {
							return;
						}

						socket.send('test_end');
						console.error('No test is running, at least create one test case to run.');

						if (argv.ci) {
							process.exit(0);
						}

					}, 5000);
				}

				if (
					testInfo.type === 'event' &&
					testInfo.data === 'suiteFinished'
				) {
					unfinishedTest = 0;
					clearTimeout(testCloseTimer);

					testCloseTimer = setTimeout(() => {

						if (!unfinishedTest && !testFailed) {
							socket.send('test_end');
							if (argv.ci) {
								process.exit(0);
							}
						} else if (!unfinishedTest) {
							socket.send('test_end_with_failed');
							if (argv.ci) {
								console.error(
									`${testFailed} test${testFailed > 1 ? 's' : ''
									} failed, diff results output at ${argv.ci}`,
								);
								process.exit(0);
							}
						}
					}, 5000);
				}

				if (testInfo.type === 'event' && testInfo.data === 'suiteRun') {
					unfinishedTest = 1;
					testStart = true;
				}
			}
		});

		socket.on('close', () => console.log('Test end, client disconnected.'));
	});
});

fastify.route({
	method: 'POST',
	url: '/shot',
	handler: async (req, reply) => {
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

		let cachedImageBuffer = null;

		try {
			let pass = false,
				diffImageBuffer = null;

			if (!fs.existsSync(imagePath)) {
				fs.ensureFileSync(imagePath);
				fs.writeFileSync(imagePath, imageDataBase64, 'base64');
				pass = true;
			} else {
				const buffer = Buffer.from(imageDataBase64, 'base64');

				cachedImageBuffer = Buffer.from(fs.readFileSync(imagePath), 'base64');

				const snapShot = PNG.sync.read(cachedImageBuffer);

				const { width, height } = snapShot;

				const diffImage = new PNG({ width, height });

				const diff = pixelmatch(
					PNG.sync.read(buffer).data,
					snapShot.data,
					diffImage.data,
					width,
					height,
					{ threshold: req.body.threshold },
				);

				diffImageBuffer = PNG.sync.write(diffImage);

				pass = diff === 0;
			}

			const diffDataURL = diffImageBuffer
				? diffImageBuffer.toString('base64')
				: null;

			if (!pass && argv.ci) {

				const outputDiffPath = path.join(
					ciOutputPath,
					`${fileName}.diff.png`,
				);
				fs.writeFileSync(outputDiffPath, diffDataURL, 'base64');

				fs.writeFileSync(path.join(
					ciOutputPath,
					`${fileName}.new.png`,
				), imageDataBase64, 'base64');

				fs.writeFileSync(path.join(
					ciOutputPath,
					`${fileName}.cache.png`,
				), cachedImageBuffer, 'base64');
			}

			reply.type('application/json').code(200);
			return { pass, dataURL: imageDataBase64, diffDataURL, cacheDataURL: cachedImageBuffer.toString('base64') };
		} catch (e) {
			console.log(e);
			reply.type('application/json').code(500);

			if (argv.ci) {
				fs.ensureFileSync(
					path.join(ciOutputPath, `${fileName}.diff.failed`),
				);

				fs.writeFileSync(path.join(
					ciOutputPath,
					`${fileName}.new.png`,
				), imageDataBase64, 'base64');
			}

			return { pass: false, dataURL: imageDataBase64, diffDataURL: null, cacheDataURL: cachedImageBuffer.toString('base64') };
		}
	},
});

const createCoverageJson = async (coverageJson) => {

	const jsonPath = path.join(
		process.cwd(),
		'coverage',
		`coverage.json`,
	);

	await fs.ensureFileSync(jsonPath);

	await fs.writeFileSync(jsonPath, coverageJson);

	const reportDir = path.join(
		process.cwd(),
		'coverage',
	);

	const nyc = new NYC({
		tempDir: reportDir,     
		reporter: ['html', 'text-summary'],       
		reportDir: reportDir,      
		cwd: process.cwd(),                       
	});

	await nyc.report();
};

fastify.listen(argv.port ? argv.port : 45670);
