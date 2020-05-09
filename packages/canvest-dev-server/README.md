<p align="center"><img height="100px" width="100px" src="https://raw.githubusercontent.com/TyrealGray/Canvest/master/canvest.png"></p>


# Canvest

Writing a unit test for your component that require render on HTML5 canvas without mocking any dom element

Using browser to render and execute your component's unit test logic directly, outputting image snapshot to compare in pixel-level

Support Typescript and zero config needed in most cases for JavaScript project, using API like `it` and `describe` with a few unique API for canvas snapshot

## Install
Run npm cmd to install on your project
```
$ npm i @canvest/canvest-cli --save-dev
```
Create a script in your package.json
```javascript
 "scripts": {
    ...
    "test": "canvest",
    ...
  },
```

## Usage example
Create your class
```javascript
export class MyClass
{
 	...
 	updateRotation(rotation){
 		this._sprite.rotation = rotation;
 	}
 	...
}
```
Create `MyClass.canvest.js` under `./canvest` folder
```javascript
import * as PIXI from 'pixi.js';
import { MyClass } from './MyClass';

describe('Test my class', () => {

	it('should update rotation as expect', async () => {

		const app = new PIXI.Application({
			width: XXX, height: YYY,
			preserveDrawingBuffer: true //<--- important
		});
		
		const myClass = new MyClass();
		app.stage.addChild(myClass._sprite);
		
		const noRotationSnapshot = await snapshot(app.view); // take a snapshot of current canvas with sprite without rotation
		
		myClass.updateRotation(1.5);
		
		const rotatedSnapshot = await snapshot(app.view); // new snapshot for current canvas with sprite rotate at 1.5
		
		noRotationSnapshot.notEqual(rotatedSnapshot);// should pass
		
		myClass.updateRotation(0.0); // rotate sprite back to no rotation
		
		const secRotationSnapshot = await snapshot(app.view); // snapshot canvas again
		
		secRotationSnapshot.isEqual(noRotationSnapshot);// should also pass
		
		secRotationSnapshot.isEqual(rotatedSnapshot); // should fail
		
	});
});
```
If some test case failed, you will see output under bottom showing the snapshot diff comparison 

<img src="https://raw.githubusercontent.com/TyrealGray/Canvest/master/showcase.png">

## API
Canvest framework is using [`Mocha`](https://mochajs.org/) with [`Chai`](https://www.chaijs.com/) under the hood, every API Mocha had in browser, Canvest should had as well.

#### **snapshot(canvas): Promise\<snapshot Object>**
take a snapshot of current canvas

- `canvas`: HTML5 canvas dom element
- `snapshot Object`: return a canvest snapshot that has 4 APIs in below
    - `isEqual( otherSnapshot )`: snapshot should completely equal to `otherSnapshot`
    - `notEqual( otherSnapshot )`: snapshot should not equal to `otherSnapshot`
    - `isMatch( otherSnapshot, tolerance )`: snapshot could equal to `otherSnapshot` if test ignores number of tolerance pixels
    - `notMatch( otherSnapshot, tolerance )`: snapshot could not equal to `otherSnapshot` even after test ignores number of tolerance pixels

#### **autoShot(name, canvas): Promise\<void>**
take a snapshot of current canvas and cached in local, if local snapshot already exists, compare current snapshot with local one automatically

- `name`: a unique name for snapshot to save under `./canvest/autoShot/(the-name-you-given).png`
- `canvas`: HTML5 canvas dom element

**as long as your local snapshot doesn't get removed, the comparison will always using local one.**

## License
AFL-3.0