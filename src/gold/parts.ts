import {Art, BrickArt} from './';
import {Brick, None} from '../parts/';
import {Part} from '../';
import {Vector2} from 'three';

let noneArt: Art = {editTile: new Vector2(0, 2)};

export class Parts {
  static tileArts = new Map<new () => Part, () => Art>([
    [Brick, () => new BrickArt()],
    [None, () => noneArt],
  ]);
}
