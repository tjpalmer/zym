import {Brick} from '../parts/';
import {Vector2} from 'three';

export class Parts {
  static tileIndices = new Map([
    [Brick, new Vector2(2, 18)],
    [undefined, new Vector2(0, 2)],
  ]);
}
