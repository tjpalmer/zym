import {Art, BrickArt, RunnerArt} from './';
import {Bar, Brick, Hero, Ladder, None} from '../parts/';
import {Part} from '../';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
let arts = {
  Bar: {editTile: new Vector2(9, 17)},
  Ladder: {editTile: new Vector2(8, 17)},
  None: {editTile: new Vector2(0, 2)},
};

export class Parts {
  static tileArts = new Map<new () => Part, () => Art>([
    [Bar, () => arts.Bar],
    [Brick, () => new BrickArt()],
    [Hero, () => new RunnerArt()],
    [Ladder, () => arts.Ladder], 
    [None, () => arts.None],
  ]);
}
