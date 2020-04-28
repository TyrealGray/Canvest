/**
 * compare two binary arrays for equality
 * @param {(ArrayBuffer|ArrayBufferView)} a
 * @param {(ArrayBuffer|ArrayBufferView)} b
 */
export function isPixelEqual(a, b) {
	if (a instanceof ArrayBuffer) a = new Uint8Array(a, 0);
	if (b instanceof ArrayBuffer) b = new Uint8Array(b, 0);
	if (a.byteLength !== b.byteLength) return false;
	if (aligned32(a) && aligned32(b))
		return equal32(a, b);
	if (aligned16(a) && aligned16(b))
		return equal16(a, b);
	return equal8(a, b);
}

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

export const snapshot = (canvas) => {
	return new Promise((resolve, reject)=>{
		setTimeout(()=> {
			try {
				const tempCanvas = document.createElement('canvas');
				tempCanvas.width = canvas.width;
				tempCanvas.height = canvas.height;

				const canvasCtx = canvas.getContext('2d');
				const cloneCtx = tempCanvas.getContext('2d');

				if (!canvasCtx) {
					cloneCtx.drawImage(canvas, 0, 0);
				} else {
					cloneCtx.putImageData(
						canvasCtx.getImageData(0, 0, canvas.width, canvas.height),
						0,
						0,
					);
				}

				resolve(cloneCtx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
			} catch (e) {
				reject(`snapshot canvas failed, ${e}`);
			}
		},100);
	});

};