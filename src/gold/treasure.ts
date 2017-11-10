import {BaseArt, Layer} from './index';
import {Prize} from '../parts/index';
import {Vector2} from 'three';

export class PrizeArt extends BaseArt<Prize> {

  constructor(prize: Prize, tile: Vector2) {
    super(prize);
    this.mainTile = tile;
  }

  layer = Layer.treasure;

  mainTile: Vector2;

  get tile() {
    return this.part.owner ? goneTile : this.mainTile;
    // return this.mainTile;
  }

}

let goneTile = new Vector2(0, 2);
