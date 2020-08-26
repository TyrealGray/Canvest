import * as PIXI from 'pixi.js';
import Sprite = PIXI.Sprite;
import Texture = PIXI.Texture;

export class Dragon {

	public sprite: PIXI.Sprite;

	constructor(container){
		this.sprite = new Sprite(Texture.from('../res/dragon.png'));
		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;
		this.sprite.x = 400;
		this.sprite.y = 300;
		container.addChild(this.sprite);
	}

	public update(delta){
		this.sprite.rotation = delta;
	}
}