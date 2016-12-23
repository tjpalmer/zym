import {Art, Layer} from './';
import {Treasure} from '../parts';
import {Vector2} from 'three';

export class TreasureArt implements Art {

  constructor(treasure: Treasure) {
    this.treasure = treasure;
  }

  layer = Layer.treasure;

  get part() {
    return this.treasure;
  }

  get tile() {
    return this.treasure.owner ? goneTile : mainTile;
  }

  treasure: Treasure;

}

let goneTile = new Vector2(0, 2);

let mainTile = new Vector2(13, 17);
