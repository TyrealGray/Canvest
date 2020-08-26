import * as PIXI from 'pixi.js';

export class Dragon {
	constructor(container){
		this.sprite = new PIXI.Sprite(PIXI.Texture.from('../res/dragon.png'));
		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;
		this.sprite.x = 400;
		this.sprite.y = 300;
		container.addChild(this.sprite);
	}

	update(delta){
		this.sprite.rotation = delta;
	}
}