import {Grid, Part} from './';
import {Vector2} from 'three';

export class Level {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  tiles = new Grid<Part | undefined>(Level.tileCount);

}
