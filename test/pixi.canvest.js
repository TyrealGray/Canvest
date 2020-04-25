// const canvas = null;
//
// describe('test canvas', () => {
//
// 	everyrun(() => {
// 		const app = new PIXI.Application({
// 			width: 800, height: 600, preserveDrawingBuffer: true
// 		});
// 		canvas = app.view;
// 		snapshotCanvas(canvas);
// 	});
//
// 	test('snapshot cnavas', (lastSnapshot) => {
// 		const bunny = new Bunny(canvas);
// 		const delta = 100;
// 		snapshot(bunny.render(delta)).toEqual(lastSnapshot);
// 	});
//
// });