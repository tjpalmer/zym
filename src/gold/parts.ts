import {Art, BrickArt, Layer, RunnerArt} from './';
import {Bar, Brick, Enemy, Hero, Ladder, None, Runner, Steel} from '../parts/';
import {Part, PartType} from '../';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
let arts = {
  Bar: {layer: Layer.back, tile: new Vector2(9, 17)},
  Ladder: {layer: Layer.back, tile: new Vector2(8, 17)},
  None: {layer: Layer.back, tile: new Vector2(0, 2)},
  Steel: {layer: Layer.front, tile: new Vector2(7, 17)},
};

export class Parts {

  static tileArts = new Map<PartType, (part: Part) => Art>([
    [Bar, part => arts.Bar],
    [Brick, part => new BrickArt()],
    [Enemy, part => new RunnerArt(part as Runner, new Vector2(15, 14))],
    [Hero, part => new RunnerArt(part as Runner, new Vector2(9, 14))],
    [Ladder, part => arts.Ladder], 
    [None, part => arts.None],
    [Steel, part => arts.Steel],
  ]);

}
