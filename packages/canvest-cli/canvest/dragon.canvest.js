import * as PIXI from 'pixi.js';
import { Dragon } from '../src/dragon';

describe('Dragon class', () => {

	it('should render the same', async () => {

		const app = new PIXI.Application({
			width: 800, height: 600, backgroundColor: 0x1099bb,
			preserveDrawingBuffer: true
		});

		const container = new PIXI.Container();
		container.width = 800;
		container.height = 600;

		await autoShot('blank', app.view);

		let dragon = new Dragon(container);
		app.stage.addChild(container);
		dragon.update(1.5);

		const renderNo1 = await snapshot(app.view);

		dragon.update(1.6);

		dragon.update(1.5);

		const renderNo2 = await snapshot(app.view);

		renderNo1.isEqual(renderNo2);

		dragon.update(1.6);

		const renderNo3 = await snapshot(app.view);

		renderNo1.isMatch(renderNo3, 0.2);
	});

	it('should not render the same', async () => {

		const app = new PIXI.Application({
			width: 800, height: 600, backgroundColor: 0x1099bb,
			preserveDrawingBuffer: true
		});

		const container = new PIXI.Container();
		container.width = 800;
		container.height = 600;
		let dragon = new Dragon(container);
		app.stage.addChild(container);
		dragon.update(0.0);

		const renderNo1 = await snapshot(app.view);

		dragon.update(1.5);

		const renderNo2 = await snapshot(app.view);

		renderNo1.notEqual(renderNo2);

		new Dragon(container);
		new Dragon(container);
		new Dragon(container);
		new Dragon(container);
		new Dragon(container);
		dragon = new Dragon(container);

		dragon.update(1.4);

		dragon.sprite.x += 2;

		const renderNo3 = await snapshot(app.view);

		renderNo2.notEqual(renderNo3);
	});
});
