import {Art, Layer} from './';
import {Prize} from '../parts';
import {Vector2} from 'three';

export class PrizeArt implements Art {

  constructor(prize: Prize, tile: Vector2) {
    this.mainTile = tile;
    this.prize = prize;
  }

  layer = Layer.treasure;

  mainTile: Vector2;

  get part() {
    return this.prize;
  }

  get tile() {
    return this.prize.owner ? goneTile : this.mainTile;
  }

  prize: Prize;

}

let goneTile = new Vector2(0, 2);
