import pixelmatch from 'pixelmatch';

const isPixelMatch = (dataA, dataB, width, height, rate) => {

	const diff = pixelmatch(dataA, dataB, null, width, height, {threshold: 0.5});

	const tolerateDiff = parseFloat(width * height) * rate;

	return diff <= parseInt(tolerateDiff);
};

const captureImage = (canvas, cloneCanvas) => {
	try {
		const canvasCtx = canvas.getContext('2d');
		const cloneCtx = cloneCanvas.getContext('2d');

		if (!canvasCtx) {
			cloneCtx.drawImage(canvas, 0, 0);
		} else {
			cloneCtx.putImageData(
				canvasCtx.getImageData(0, 0, canvas.width, canvas.height),
				0,
				0,
			);
		}

		const imageData = cloneCtx.getImageData(0, 0, canvas.width, canvas.height).data;

		const equal = (capture) => {
			return isPixelMatch(imageData,capture.imageData, canvas.width, canvas.height, 0);
		};

		const match = (capture, rate) => {
			return isPixelMatch(imageData,capture.imageData, canvas.width, canvas.height, rate);
		};

		return {
			imageData,
			match,
			equal
		};
	} catch (e) {
		throw e;
	}
};

export const snapshot = (canvas) => {

	return new Promise((resolve, reject) => {

		const captures = [];

		const tempCanvas = document.createElement('canvas');

		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;

		const timeout = (parseInt(canvas.width / 1000.0) + parseInt(canvas.height / 1000.0)) * 50 + 100;

		const stableCapture = (canvas, cloneCanvas) => {
			try {

				const capture = captureImage(canvas, cloneCanvas);

				if (captures.length < 3) {
					captures.push(capture);
				} else {
					if (captures[0].equal(captures[1])
						&& captures[1].equal(captures[2])
						&& captures[2].equal(capture)
					) {

						return resolve({...capture});
					} else {
						console.warn(`snapshot not stable redo capture`);
						captures.shift();
						captures.push(capture);
					}
				}

				setTimeout(() => {
					stableCapture(canvas, cloneCanvas);
				}, timeout);
			} catch (e) {
				reject(`snapshot canvas failed, ${e}`);
			}
		};

		setTimeout(() => {
			stableCapture(canvas, tempCanvas);
		}, 100);
	});

};