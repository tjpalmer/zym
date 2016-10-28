import {Level} from './';
import {Vector2} from 'three';

export class Part {

  art: any = undefined;

  point = new Vector2();

}

export class Scene {

  // During level editing, these corresponding exactly to level tile indices.
  // This can include nones.
  // While that's somewhat wasteful, as most levels will be fairly sparse, we
  // have to be able to support full levels, too, and if we don't have to be
  // inserting and deleting all the time, life will be easier.
  // Of course, we can skip the nones when building for actual play, if we want.
  parts = new Array<Part>(Level.tileCount.x * Level.tileCount.y);

}

export interface Theme {

  buildArt(part: Part): void;

}