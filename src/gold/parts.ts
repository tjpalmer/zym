import {Art, BrickArt, Layer, RunnerArt} from './';
import {Bar, Brick, Hero, Ladder, None} from '../parts/';
import {Part, PartType} from '../';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
let arts = {
  Bar: {editTile: new Vector2(9, 17), layer: Layer.back},
  Ladder: {editTile: new Vector2(8, 17), layer: Layer.back},
  None: {editTile: new Vector2(0, 2), layer: Layer.back},
};

export class Parts {
  static tileArts = new Map<PartType, () => Art>([
    [Bar, () => arts.Bar],
    [Brick, () => new BrickArt()],
    [Hero, () => new RunnerArt()],
    [Ladder, () => arts.Ladder], 
    [None, () => arts.None],
  ]);
}
