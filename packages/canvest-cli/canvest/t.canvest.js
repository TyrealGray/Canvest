describe('js', function () {
	it('should pass', async function () {
		expect(1).to.equal(1);
		let canvas = document.createElement('canvas');
		canvas.width = 800;
		canvas.height = 600;
		const a = await snapshot(canvas);
		const context = canvas.getContext('2d');
		context.fillStyle = '#ff0';
		context.fillRect(0, 0, 800, 600);

		const text = 'Hello, World!';

		context.font = 'bold 70pt Menlo';
		context.textAlign = 'center';
		context.fillStyle = '#fff';
		context.fillText(text, 200, 200);

		const b = await snapshot(canvas);
		a.notEqual(b);
		await autoShot('test', canvas);
	});

	describe('js', function () {
		it('should pass 11', async function () {
			expect(1).to.equal(1);
		});

		it('should pass 13', function () {
			expect(1).to.equal(1);
		});

		it('should pass 1132', async function () {
			expect(1).to.equal(1);
		});

		it('should pass 1221', function () {
			expect(1).to.equal(1);
		});
	});
});
