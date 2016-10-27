import {Art} from './';
import {Brick, None} from '../parts/';
import {Part} from '../';
import {Vector2} from 'three';

let noneArt: Art = {editTile: new Vector2(0, 2)};

export class Parts {
  static tileIndices = new Map<new () => Part, Vector2>([
    [Brick, new Vector2(2, 18)],
    [None, new Vector2(0, 2)],
  ]);
}
