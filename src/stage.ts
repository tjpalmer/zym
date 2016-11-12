import {Level, Game} from './';
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

  // For overriding.
  editPlacedAt(tilePoint: Vector2) {}

  game: Game;

  point = new Vector2();

  solid(edge: Edge) {
    return false;
  }

  surface = false;

  tick() {}

}

export interface PartType {
  new (game: Game): Part;
  char: string;
}

export class Stage {

  constructor(game: Game) {
    this.game = game;
  }

  game: Game;

  // During level editing, these corresponding exactly to level tile indices.
  // This can include nones.
  // While that's somewhat wasteful, as most levels will be fairly sparse, we
  // have to be able to support full levels, too, and if we don't have to be
  // inserting and deleting all the time, life will be easier.
  // Of course, we can skip the nones when building for actual play, if we want.
  parts = new Array<Part>(Level.tileCount.x * Level.tileCount.y);

  tick() {
    for (let part of this.parts) {
      part.tick();
    }
  }

}

export interface Theme {

  buildArt(part: Part): void;

  buildDone(game: Game): void;

}