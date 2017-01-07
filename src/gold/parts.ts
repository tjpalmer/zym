import {
  Art, BiggieArt, BrickArt, EnergyArt, LatchArt, Layer, RunnerArt, PrizeArt,
} from './';
import {
  Bar, Biggie, BiggieLeft, BiggieRight, Bonus, Brick, Enemy, Energy, EnergyOff,
  Hero, Ladder, Latch, LatchLeft, LatchRight, LauncherCenter, LauncherDown,
  LauncherLeft, LauncherRight, LauncherUp, None, Prize, Runner, Steel, Treasure,
} from '../parts/';
import {Part, PartType} from '../';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
export let arts = {
  Bar: {layer: Layer.back, tile: new Vector2(9, 17)},
  Ladder: {layer: Layer.back, tile: new Vector2(8, 17)},
  LauncherCenter: {layer: Layer.back, tile: new Vector2(12, 17)},
  LauncherDown: {layer: Layer.back, tile: new Vector2(11, 17)},
  LauncherLeft: {layer: Layer.back, tile: new Vector2(10, 16)},
  LauncherRight: {layer: Layer.back, tile: new Vector2(11, 16)},
  LauncherUp: {layer: Layer.back, tile: new Vector2(10, 17)},
  None: {layer: Layer.back, tile: new Vector2(0, 2)},
  Steel: {layer: Layer.front, tile: new Vector2(7, 17)},
};

export class Parts {

  static tileArts = new Map<PartType, (part: Part) => Art>([
    [Bar, artMaker(arts.Bar)],
    [BiggieLeft, part => new BiggieArt(part as Biggie)],
    [BiggieRight, part => new BiggieArt(part as Biggie)],
    [Bonus, part => new PrizeArt(part as Prize, new Vector2(13, 16))],
    [Brick, part => new BrickArt(part as Brick)],
    [Enemy, part => new RunnerArt(part as Runner, new Vector2(15, 14))],
    [Energy, part => new EnergyArt(part as Energy)],
    [EnergyOff, part => new EnergyArt(part as Energy)],
    [Hero, part => new RunnerArt(part as Runner, new Vector2(9, 14))],
    [Ladder, artMaker(arts.Ladder)], 
    [LatchLeft, part => new LatchArt(part as Latch)],
    [LatchRight, part => new LatchArt(part as Latch)],
    [LauncherCenter, artMaker(arts.LauncherCenter)], 
    [LauncherDown, artMaker(arts.LauncherDown)], 
    [LauncherLeft, artMaker(arts.LauncherLeft)], 
    [LauncherRight, artMaker(arts.LauncherRight)], 
    [LauncherUp, artMaker(arts.LauncherUp)], 
    [None, artMaker(arts.None)],
    [Steel, artMaker(arts.Steel)],
    [Treasure, part => new PrizeArt(part as Prize, new Vector2(13, 17))],
  ]);

}

function artMaker(base: {layer: Layer, tile: Vector2}) {
  return (part: Part): Art => {
    return {layer: base.layer, part, tile: base.tile};
  }
}
