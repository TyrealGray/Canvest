import { snapshot } from '@canvest/canvest-core';
import pixelmatch from 'pixelmatch';

let canvestReady = false,
	socketInitFailed = false;

const autoAddingDiffCanvas = (title, dataURL, w, h) => {
	const canvas = document.createElement('canvas');
	canvas.width = 300;
	canvas.height = canvas.width / (w / h);
	const context = canvas.getContext('2d');
	const img = new Image();

	img.onload = () => {
		context.drawImage(img, 0, 0, canvas.width, canvas.height);
		const span = document.createElement('span');
		span.style = 'float:left';
		const div = document.createElement('div');
		const text = document.createTextNode(title);
		div.style = 'text-align: center';
		div.appendChild(text);
		span.appendChild(div);
		span.appendChild(canvas);
		document.body.appendChild(span);
	};

	img.src = dataURL;
};

const outputDiff = (a, b, w, h, socket) => {
	const diffCanvas = document.createElement('canvas');
	diffCanvas.width = w;
	diffCanvas.height = h;
	const diffContext = diffCanvas.getContext('2d');

	const diff = diffContext.createImageData(w, h);

	pixelmatch(a.imageData, b.imageData, diff.data, w, h, { threshold: 0.05 });
	diffContext.putImageData(diff, 0, 0);

	autoAddingDiffCanvas(
		'failed test diff',
		diffCanvas.toDataURL('image/png'),
		w,
		h,
	);

	if (!socketInitFailed) {
		socket.send(
			JSON.stringify({
				type: 'diff', data: diffCanvas.toDataURL('image/png'),
			}),
		);
	}
};

window.initCanvest = (config) => {
	const socket = new WebSocket(`ws://localhost:${config.cachePort}/`);

	socket.addEventListener('open', () => {
		window.socket = socket;
		canvestReady = true;

		before(() => {
			socket.send(
				JSON.stringify({ type: 'event', data: 'suiteRun' }),
			);
		});

		after(() => {
			socket.send(
				JSON.stringify({
					type: 'event',
					data: 'suiteFinished',
				}),
			);
		});

		socket.send(
			JSON.stringify({ type: 'event', data: 'testInit' }),
		);
	});

	socket.addEventListener('message', (event) => {
		console.log('Message from CDS', event.data);
	});

	socket.addEventListener('error', (error) => {
		canvestReady = true;
		socketInitFailed = true;
		console.error(error);
	});

	window.snapshot = async (canvasView) => {
		const capture = await snapshot(canvasView);
		capture.isEqual = (otherCapture) => {
			const result = capture.equal(otherCapture);
			if (!result) {
				outputDiff(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
				);
			}

			assert(result, `snapshot is not equal, expect to be equal`);
		};

		capture.notEqual = (otherCapture) => {
			const result = capture.equal(otherCapture);
			if (result) {
				outputDiff(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
				);
			}

			assert(!result, `snapshot is equal, expect to be not equal`);
		};

		capture.isMatch = (otherCapture, rate) => {
			const result = capture.match(otherCapture, rate);
			if (!result) {
				outputDiff(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
				);
			}
			assert(result, `snapshot is not match, expect to be match`);
		};

		capture.notMatch = (otherCapture, rate) => {
			const result = capture.match(otherCapture, rate);

			if (result) {
				outputDiff(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
				);
			}
			assert(!result, `snapshot is match, expect to be not match`);
		};

		return capture;
	};

	window.autoShot = async (name, canvasView) => {
		const capture = await snapshot(canvasView);

		const url = new URL(`http://localhost:${config.cachePort}/shot`);

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
			body: JSON.stringify({
				name,
				dataURL: capture.dataURL,
			}),
		});
		const resJson = await res.json();

		if (!resJson.pass) {

			if (!socketInitFailed) {
				socket.send(
					JSON.stringify({ type: 'info', data: 'testFailed' }),
				);
			}

			if (resJson.dataURL) {
				autoAddingDiffCanvas(
					`(${name}) cached diff`,
					`data:image/png;base64,${resJson.dataURL}`,
					canvasView.width,
					canvasView.height,
				);

				assert(
					false,
					`new (${name}) snapshot is not match cached snapshot`,
				);
			} else {
				assert(
					false,
					`new (${name}) snapshot is unable to compare with cached snapshot`,
				);
			}
		}
	};

	window.runMocha = () => {
		if (canvestReady) {
			mocha.run();
		} else {
			setTimeout(() => {
				window.runMocha();
			}, 1000);
		}
	};

	runMocha();
};
