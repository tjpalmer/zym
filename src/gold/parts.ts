import {
  Art, BiggieArt, BrickArt, EnergyArt, LatchArt, Layer, RunnerArt, TreasureArt,
} from './';
import {
  Bar, Biggie, BiggieLeft, BiggieRight, Brick, Enemy, Energy, EnergyOff, Hero,
  Ladder, Latch, LatchLeft, LatchRight, None, Runner, Steel, Treasure,
} from '../parts/';
import {Part, PartType} from '../';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
export let arts = {
  Bar: {layer: Layer.back, tile: new Vector2(9, 17)},
  Ladder: {layer: Layer.back, tile: new Vector2(8, 17)},
  None: {layer: Layer.back, tile: new Vector2(0, 2)},
  Steel: {layer: Layer.front, tile: new Vector2(7, 17)},
};

export class Parts {

  static tileArts = new Map<PartType, (part: Part) => Art>([
    [Bar, artMaker(arts.Bar)],
    [BiggieLeft, part => new BiggieArt(part as Biggie)],
    [BiggieRight, part => new BiggieArt(part as Biggie)],
    [Brick, part => new BrickArt(part as Brick)],
    [Enemy, part => new RunnerArt(part as Runner, new Vector2(15, 14))],
    [Energy, part => new EnergyArt(part as Energy)],
    [EnergyOff, part => new EnergyArt(part as Energy)],
    [Hero, part => new RunnerArt(part as Runner, new Vector2(9, 14))],
    [Ladder, artMaker(arts.Ladder)], 
    [LatchLeft, part => new LatchArt(part as Latch)],
    [LatchRight, part => new LatchArt(part as Latch)],
    [None, artMaker(arts.None)],
    [Steel, artMaker(arts.Steel)],
    [Treasure, part => new TreasureArt(part as Treasure)],
  ]);

}

function artMaker(base: {layer: Layer, tile: Vector2}) {
  return (part: Part): Art => {
    return {layer: base.layer, part, tile: base.tile};
  }
}
