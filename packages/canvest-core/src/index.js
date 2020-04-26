

export const snapshot = (canvas, clone) => {
	try {
		if (clone) {
			clone.width = canvas.width;
			clone.height = canvas.height;

			const canvasCtx = canvas.getContext('2d');
			const cloneCtx = clone.getContext('2d');

			if (!canvasCtx) {
				cloneCtx.drawImage(canvas, 0, 0);
			} else {
				cloneCtx.putImageData(
					canvasCtx.getImageData(0, 0, canvas.width, canvas.height),
					0,
					0,
				);
			}

			return clone.toDataURL();
		}
	} catch (e) {
		console.error(`snapshot canvas failed, ${e}`);
	}
};
