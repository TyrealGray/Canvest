function containPixel(snapshotA, snapshotB, rate){

}

const isPixelEqual = (snapshotA, snapshotB) => {

	let a = snapshotA.buffer, b = snapshotB.buffer;

	if (a instanceof ArrayBuffer) a = new Uint8Array(a, 0);
	if (b instanceof ArrayBuffer) b = new Uint8Array(b, 0);
	if (a.byteLength !== b.byteLength) return false;
	if (aligned32(a) && aligned32(b))
		return equal32(a, b);
	if (aligned16(a) && aligned16(b))
		return equal16(a, b);
	return equal8(a, b);
};

function equal8(a, b) {
	const ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
	const ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
	return compare(ua, ub);
}

function equal16(a, b) {
	const ua = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
	const ub = new Uint16Array(b.buffer, b.byteOffset, b.byteLength / 2);
	return compare(ua, ub);
}

function equal32(a, b) {
	const ua = new Uint32Array(a.buffer, a.byteOffset, a.byteLength / 4);
	const ub = new Uint32Array(b.buffer, b.byteOffset, b.byteLength / 4);
	return compare(ua, ub);
}

function compare(a, b) {
	for (let i = a.length; -1 < i; i -= 1) {
		if ((a[i] !== b[i])) return false;
	}
	return true;
}

function aligned16(a) {
	return (a.byteOffset % 2 === 0) && (a.byteLength % 2 === 0);
}

function aligned32(a) {
	return (a.byteOffset % 4 === 0) && (a.byteLength % 4 === 0);
}

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

		const captureId = Math.random();
		const buffer = cloneCtx.getImageData(0, 0, canvas.width, canvas.height).data.buffer;
		const dataURL = cloneCanvas.toDataURL();
		const contain = (capture) => {
			console.log(`${captureId} should contain ${capture.captureId}`);
		};

		const equal = (capture) => {
			return isPixelEqual({buffer},capture);
		};

		return {
			captureId,
			buffer,
			dataURL,
			contain,
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
					if (isPixelEqual(captures[0], captures[1])
						&& isPixelEqual(captures[1], captures[2])
						&& isPixelEqual(captures[2], capture)) {

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