import {BaseArt, Layer} from './index';
import {Energy, EnergyOff, Latch, LatchLeft, LatchRight} from '../parts/index';
import {Vector2} from 'three';

export class EnergyArt extends BaseArt<Energy> {

  layer = Layer.front;

  get tile() {
    let {part, workPoint} = this;
    let {game} = part;
    if (game.mode == game.edit) {
      return this.toolTile;
    }
    workPoint.set(16, 16);
    if (!part.on) {
      workPoint.set(0, 2);
    }
    return workPoint;
  }

  get toolTile() {
    let {part, workPoint} = this;
    workPoint.set(16, 16);
    if (!part.on) {
      ++workPoint.x;
    }
    return workPoint;
  }

  workPoint = new Vector2();

}

export class LatchArt extends BaseArt<Latch> {

  layer = Layer.front;

  get tile() {
    let {part} = this;
    let {time} = part.game.stage;
    this.workPoint.set(20, 16);
    if (time < part.changeTime + 8 / 60 || !part.facing) {
      // Center facing. TODO Separate facing from state.
      this.workPoint.x -= 1;
    } else if (part.facing < 0) {
      this.workPoint.x -= 2;
    }
    return this.workPoint;
  }

  workPoint = new Vector2();

}
