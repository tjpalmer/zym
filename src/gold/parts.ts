import {
  Art, BiggieArt, BrickArt, CrusherArt, DropArt, EnergyArt, Flame, FlameArt,
  GunArt, LatchArt, Layer, RunnerArt, PrizeArt,
} from './index';
import {
  Bar, Biggie, BiggieLeft, BiggieRight, Bonus, Brick, Crusher, Drop, Dropper,
  Enemy, Energy, EnergyOff, GunLeft, GunRight, Hero, Ladder, Latch, LatchLeft,
  LatchRight, LauncherCenter, LauncherDown, LauncherLeft, LauncherRight,
  LauncherUp, None, Prize, Runner, Shot, Spawn, Steel, Treasure,
} from '../parts/index';
import {Part, PartType} from '../index';
import {Vector2} from 'three';

// Simple arts for unchanging parts.
export let arts = {
  Bar: {layer: Layer.back, tile: new Vector2(9, 17)},
  Dropper: {layer: Layer.treasure, tile: new Vector2(14, 16)},
  Ladder: {layer: Layer.back, tile: new Vector2(8, 17)},
  LauncherCenter: {layer: Layer.back, tile: new Vector2(12, 17)},
  LauncherDown: {layer: Layer.back, tile: new Vector2(11, 17)},
  LauncherLeft: {layer: Layer.back, tile: new Vector2(10, 16)},
  LauncherRight: {layer: Layer.back, tile: new Vector2(11, 16)},
  LauncherUp: {layer: Layer.back, tile: new Vector2(10, 17)},
  None: {layer: Layer.back, tile: new Vector2(0, 2)},
  Shot: {layer: Layer.shot, tile: new Vector2(22, 10)},
  Spawn: {layer: Layer.back, tile: new Vector2(12, 16)},
  Steel: {layer: Layer.front, tile: new Vector2(7, 17)},
};

interface SimpleArt {
  layer: Layer;
  tile: Vector2;
}

export class Parts {

  // TODO 'any' because Shot and other dynamic part types.
  // TODO Split into different part type types and be more specific here?
  static tileArts = new Map<any, (part: Part) => Art>([
    [Bar, artMaker(arts.Bar)],
    [BiggieLeft, part => new BiggieArt(part as Biggie)],
    [BiggieRight, part => new BiggieArt(part as Biggie)],
    [Bonus, part => new PrizeArt(part as Prize, new Vector2(13, 16))],
    [Brick, part => new BrickArt(part as Brick)],
    [Drop, part => new DropArt(part as Drop)],
    [Crusher, part => new CrusherArt(part as Crusher)],
    [Dropper, artMaker(arts.Dropper)],
    [Enemy, part => new RunnerArt(part as Runner, new Vector2(15, 14))],
    [Energy, part => new EnergyArt(part as Energy)],
    [EnergyOff, part => new EnergyArt(part as Energy)],
    [Flame, part => new FlameArt(part as Flame)],
    [GunLeft, part => new GunArt(part as GunLeft)],
    [GunRight, part => new GunArt(part as GunRight)],
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
    [Shot, artMaker(arts.Shot)],
    [Spawn, artMaker(arts.Spawn)],
    [Steel, artMaker(arts.Steel)],
    [Treasure, part => new PrizeArt(part as Prize, new Vector2(13, 17))],
  ]);

}

function artMaker({layer, tile}: SimpleArt) {
  return (part: Part): Art => {
    return {layer, offsetX: 0, part, tile, toolTile: tile};
  }
}
