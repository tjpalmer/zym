import {Game, Level} from './';
import {Vector2} from 'three';

export enum Edge {
  all,
  bottom,
  left,
  right,
  top,
}

export class Part {

  static get base(): PartType {
    return this as PartType;
  }

  static ender = false;

  static make(game: Game) {
    return new this(game);
  }

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

  climbable(other: Part) {
    return false;
  }

  contains(point: Vector2) {
    let {x, y} = this.point;
    return (
      point.x >= x && point.x < x + Level.tileSize.x &&
      point.y >= y && point.y < y + Level.tileSize.y);
  }

  dead = false;

  die(killer?: Part) {
    this.dead = true;
  }

  // For overriding.
  editPlacedAt(tilePoint: Vector2) {}

  get exists() {
    return true;
  }

  game: Game;

  // A way of drawing attention.
  keyTime = -10;

  move = new Vector2();

  moved = new Vector2();

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

  get phased() {
    return this.game.stage.time < this.phaseEndTime;
  }

  phaseBeginPoint = new Vector2();

  phaseBeginTime = 0;

  phaseEndPoint = new Vector2();

  phaseEndTime = 0;

  point = new Vector2();

  reset() {}

  get shootable() {
    return this.solid(this);
  }

  get shotKillable() {
    return false;
  }

  // TODO Inside solid for burned bricks vs enemies, or launchers for all?
  solid(other: Part, edge?: Edge, seems?: boolean) {
    return false;
  }

  solidInside(other: Part, edge: Edge) {
    return false;
  }

  surface(other: Part, seems?: boolean) {
    return false;
  }

  get type() {
    return this.constructor as PartType;
  }

  update() {}

  workPoint = new Vector2();

}

export interface PartType {

  base: PartType;

  char: string;

  ender: boolean;

  // Use instead of new, so we can return base types.
  make(game: Game): Part;

  name: string;

  // Don't use new. Use make. It just helps TypeScript know we're a class.
  new (game: Game): Part;

}
