import { snapshot } from '@canvest/canvest-core';

window.snapshot = (canvasView) => {
	return new Promise((resolve => {
		snapshot(canvasView).then((capture) => {
			capture.isEqual = (otherCapture) => {
				expect(capture.equal(otherCapture)).to.equal(true);
			};

			capture.notEqual = (otherCapture) => {
				expect(capture.equal(otherCapture)).to.equal(false);
			};

			capture.isContain = (otherCapture) => {
				// expect(capture.contain(otherCapture)).to.equal(true);
			};

			capture.notContain = (otherCapture) => {
				// expect(capture.contain(otherCapture)).to.equal(false);
			};

			resolve(capture);
		});
	}));
};