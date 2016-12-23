import {Game, Level} from './';
import {Vector2} from 'three';

export enum Edge {
  top,
  right,
  bottom,
  left,
}

export class Part {

  static get base(): PartType {
    return this as PartType;
  }

  static ender = false;

  constructor(game: Game) {
    this.game = game;
  }

  art: any = undefined;

  carried = false;

  // Bars catch heros and enemies, and burned bricks catch enemies (or inside
  // solid for burned bricks?).
  catches(part: Part) {
    return false;
  }

  choose() {}

  climbable = false;

  contains(point: Vector2) {
    let {x, y} = this.point;
    return (
      point.x >= x && point.x < x + Level.tileSize.x &&
      point.y >= y && point.y < y + Level.tileSize.y);
  }

  // For overriding.
  editPlacedAt(tilePoint: Vector2) {}

  get ender() {
    return (this.constructor as PartType).ender;
  }

  game: Game;

  move = new Vector2();

  // TODO Switch to using this once we have moving supports (enemies)!!
  partAt(x: number, y: number, keep: (part: Part) => boolean) {
    return (
      this.game.stage.partAt(this.workPoint.set(x, y).add(this.point), keep));    
  }

  // TODO Switch to using this once we have moving supports (enemies)!!
  partsAt(x: number, y: number) {
    return (
      this.game.stage.partsAt(this.workPoint.set(x, y).add(this.point)));    
  }

  partsNear(x: number, y: number) {
    return (
      this.game.stage.partsNear(this.workPoint.set(x, y).add(this.point)) ||
      []);    
  }

  point = new Vector2();

  // TODO Inside solid for burned bricks vs enemies, or launchers for all?
  solid(other: Part, edge?: Edge) {
    return false;
  }

  surface = false;

  update() {}

  workPoint = new Vector2();

}

export interface PartType {
  new (game: Game): Part;
  base: PartType;
  char: string;
  ender: boolean;
}
