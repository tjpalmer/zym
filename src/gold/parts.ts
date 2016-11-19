import {Art, BrickArt, Layer, RunnerArt} from './';
import {Bar, Brick, Enemy, Hero, Ladder, None, Steel} from '../parts/';
import {Part, PartType} from '../';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
let arts = {
  Bar: {editTile: new Vector2(9, 17), layer: Layer.back},
  Enemy: {editTile: new Vector2(15, 14), layer: Layer.enemy},
  Ladder: {editTile: new Vector2(8, 17), layer: Layer.back},
  None: {editTile: new Vector2(0, 2), layer: Layer.back},
  Steel: {editTile: new Vector2(7, 17), layer: Layer.front},
};

export class Parts {
  static tileArts = new Map<PartType, () => Art>([
    [Bar, () => arts.Bar],
    [Brick, () => new BrickArt()],
    [Enemy, () => arts.Enemy], 
    [Hero, () => new RunnerArt()],
    [Ladder, () => arts.Ladder], 
    [None, () => arts.None],
    [Steel, () => arts.Steel],
  ]);
}
