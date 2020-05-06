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

			capture.isMatch = (otherCapture, rate) => {
				expect(capture.match(otherCapture, rate)).to.equal(true);
			};

			capture.notMatch = (otherCapture, rate) => {
				expect(capture.match(otherCapture, rate)).to.equal(false);
			};

			resolve(capture);
		});
	}));
};

const socket = new WebSocket('ws://localhost:45670');

// Connection opened
socket.addEventListener('open',  (event) => {
	socket.send('init canvest-client');
});

// Listen for messages
socket.addEventListener('message', (event) => {
	console.log('Message from server ', event.data);
});