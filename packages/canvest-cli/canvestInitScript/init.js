import { snapshot } from '@canvest/canvest-core';
import pixelmatch from 'pixelmatch';

let canvestReady = false,
	socketInitFailed = false,
	threshold = 0.05;

const addingGroupSnapshotCanvasResult = (title, dataURLA, dataURLB, dataURLDiff, w, h) => {
	const spanGroup = document.createElement('span');
	spanGroup.style = 'float:left; padding: 0 10px 0 10px;';
	const div = document.createElement('div');
	const text = document.createTextNode(title);
	div.style = 'text-align: center; background: red; border-radius:10px';
	div.appendChild(text);
	spanGroup.appendChild(div);
	document.body.appendChild(spanGroup);


	createSnapshotCanvas('snapshot', dataURLA, w, h, spanGroup);
	createSnapshotCanvas('diff', dataURLDiff, w, h, spanGroup);
	createSnapshotCanvas('comparing snapshot', dataURLB, w, h, spanGroup);
};

const createSnapshotCanvas = (title, dataURL, w, h, element) => {
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
		element.appendChild(span);
	};

	img.src = dataURL;
};

const outputSnapshot = (a, b, w, h, socket, caseTitle, outputDiff) => {
	const diffCanvas = document.createElement('canvas');
	diffCanvas.width = w;
	diffCanvas.height = h;
	const diffContext = diffCanvas.getContext('2d');

	const diff = diffContext.createImageData(w, h);

	pixelmatch(a.imageData, b.imageData, diff.data, w, h, { threshold: 0.05 });
	diffContext.putImageData(diff, 0, 0);

	addingGroupSnapshotCanvasResult(
		caseTitle,
		a.dataURL,
		b.dataURL,
		outputDiff? diffCanvas.toDataURL('image/png') : null,
		w,
		h,
	);

	if (!socketInitFailed) {
		socket.send(
			JSON.stringify({
				type: 'diff', data: diffCanvas.toDataURL('image/png'), a: a.dataURL, b: b.dataURL,
			}),
		);
	}
};

window.setThreshold = (number) => {
	threshold = number;
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
			console.log('coverage', window.__coverage__);
			socket.send(JSON.stringify({type: 'coverage', data: JSON.stringify(window.__coverage__)}));
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
		let endDiv = null;
		switch (event.data) {
			case 'test_end':
			case 'test_end_with_failed':
				endDiv = document.createElement('div');
				endDiv.className = event.data;
				document.body.appendChild(endDiv);
				break;
			default:
				break;
		}
	});

	socket.addEventListener('error', (error) => {
		canvestReady = true;
		socketInitFailed = true;
		console.error(error);
	});

	window.snapshot = async (canvasView) => {
		const capture = await snapshot(canvasView, threshold);
		capture.isEqual = (otherCapture) => {
			const result = capture.equal(otherCapture, threshold);
			if (!result) {
				outputSnapshot(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
					'isEqual failed',
					true
				);
			}

			assert(result, `snapshot is not equal, expect to be equal`);
		};

		capture.notEqual = (otherCapture) => {
			const result = capture.equal(otherCapture, threshold);
			if (result) {
				outputSnapshot(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
					'notEqual failed',
					false
				);
			}

			assert(!result, `snapshot is equal, expect to be not equal`);
		};

		capture.isMatch = (otherCapture, rate) => {
			const result = capture.match(otherCapture, rate, threshold);
			if (!result) {
				outputSnapshot(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
					'isMatch failed',
					true
				);
			}
			assert(result, `snapshot is not match, expect to be match`);
		};

		capture.notMatch = (otherCapture, rate) => {
			const result = capture.match(otherCapture, rate, threshold);

			if (result) {
				outputSnapshot(
					capture,
					otherCapture,
					canvasView.width,
					canvasView.height,
					socket,
					'notMatch failed',
					false
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
				threshold,
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

			addingGroupSnapshotCanvasResult(
				`(${name}) cached snapshot not match`,
				`data:image/png;base64,${resJson.cacheDataURL}`,
				`data:image/png;base64,${resJson.dataURL}`,
				resJson.dataURL? `data:image/png;base64,${resJson.diffDataURL}` : null,
				canvasView.width,
				canvasView.height,
			);

			if (resJson.diffDataURL) {
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
