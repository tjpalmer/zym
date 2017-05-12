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

  static get common(): GenericPartType {
    return this as GenericPartType;
  }

  static ender = false;

  static invisible = false;

  static make(game: Game) {
    return new this(game);
  }

  static options = {
    ender: true,
    invisible: true,
  };

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
    let wasDead = this.dead;
    if (!wasDead) {
      // TODO Handle subtype death event in separate function.
      this.dead = true;
      this.game.stage.died(this);
    }
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

  touchKills(other: Part) {
    return this.solid(other);
  }

  get type() {
    return this.constructor as PartType;
  }

  update() {}

  // State that can be updated on stage init.
  updateInfo() {}

  workPoint = new Vector2();

}

export interface PartOptions {

    ender: boolean;

    invisible: boolean;

}

export interface GenericPartType extends PartOptions {

  // Whenever a group of types should be considered somewhat equivalent.
  common: GenericPartType;

  name: string;

}

// TODO Another generic "makeable" type.

export interface PartType extends GenericPartType {

  base: PartType;

  char: string;

  // Use instead of new, so we can return base types.
  make(game: Game): Part;

  // Don't use new. Use make. It just helps TypeScript know we're a class.
  new (game: Game): Part;

  // The options that this part type is allowed to take on.
  options: PartOptions;

}
