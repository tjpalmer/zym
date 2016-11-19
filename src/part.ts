import {Game, Level} from './';
import {Vector2} from 'three';

export enum Edge {
  top,
  right,
  bottom,
  left,
}

export class Part {

  constructor(game: Game) {
    this.game = game;
  }

  art: any = undefined;

  // Bars catch heros and enemies, and burned bricks catch enemies (or inside
  // solid for burned bricks?).
  catches(part: Part) {
    return false;
  }

  climbable = false;

  contains(point: Vector2) {
    let {x, y} = this.point;
    return (
      point.x >= x && point.x < x + Level.tileSize.x &&
      point.y >= y && point.y < y + Level.tileSize.y);
  }

  // For overriding.
  editPlacedAt(tilePoint: Vector2) {}

  game: Game;

  point = new Vector2();

  // TODO Inside solid for burned bricks vs enemies, or launchers for all?
  solid(edge?: Edge) {
    return false;
  }

  surface = false;

  tick() {}

}

export interface PartType {
  new (game: Game): Part;
  char: string;
}
