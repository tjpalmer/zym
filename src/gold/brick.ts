import {Art, Layer} from './';
import {Vector2} from 'three';

export class BrickArt implements Art {

  editTile = new Vector2(2, 18);

  layer = Layer.front;

}
