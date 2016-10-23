import {Grid, Part} from './';
import {None} from './parts';
import {Vector2} from 'three';

export class Level {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor() {
    this.tiles = new Grid<new () => Part>(Level.tileCount);
    this.tiles.items.fill(None);
  }

  tiles: Grid<new () => Part>;

}
