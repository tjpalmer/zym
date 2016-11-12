import {Art, Layer} from './';
import {Vector2} from 'three';

export class RunnerArt implements Art {

  // TODO Different base for enemy vs hero, passed in on constructor?
  editTile = new Vector2(9, 14);

  // TODO Also on constructor.
  layer = Layer.hero;

}
