import {Art, Layer} from './';
import {Vector2} from 'three';

export class BrickArt implements Art {

  layer = Layer.front;

  tile = new Vector2(2, 18);

}
