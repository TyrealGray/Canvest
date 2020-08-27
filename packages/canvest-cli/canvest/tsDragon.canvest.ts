import * as PIXI from 'pixi.js';
import { Dragon } from '../testSrc/tsDragon';

describe('Typescript test case', () => {

	it('should render same', async () => {

		const app:PIXI.Application = new PIXI.Application({
			width: 800, height: 600, backgroundColor: 0x1099bb,
			preserveDrawingBuffer: true
		});

		const container:PIXI.Container = new PIXI.Container();
		container.width = 800;
		container.height = 600;
		const dragon = new Dragon(container);
		app.stage.addChild(container);
		dragon.update(1.5);

		const renderNo1 = await snapshot(app.view);

		const renderNo2 = await snapshot(app.view);

		renderNo1.isEqual(renderNo2);
	});

	it('should not render same', async () => {

		const app = new PIXI.Application({
			width: 800, height: 600, backgroundColor: 0x1099bb,
			preserveDrawingBuffer: true
		});

		const container = new PIXI.Container();
		container.width = 800;
		container.height = 600;
		const dragon = new Dragon(container);
		app.stage.addChild(container);
		dragon.update(0.0);

		const renderNo1 = await snapshot(app.view);

		dragon.update(1.4);

		const renderNo2 = await snapshot(app.view);

		renderNo1.notEqual(renderNo2);

	});
});
