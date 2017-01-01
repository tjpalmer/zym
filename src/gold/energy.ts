import {Art, Layer} from './';
import {Energy, EnergyOff, Latch, LatchLeft, LatchRight} from '../parts';
import {Vector2} from 'three';

export class EnergyArt implements Art {

  constructor(energy: Energy) {
    this.energy = energy;
  }

  energy: Energy;

  layer = Layer.front;

  get part() {
    return this.energy;
  }

  get tile() {
    let {energy, workPoint} = this;
    let {game} = energy;
    workPoint.set(16, 16);
    if (!energy.on) {
      if (game.mode == game.edit) {
        workPoint.x += 1;
      } else {
        workPoint.set(0, 2);
      }
    }
    return workPoint;
  }

  workPoint = new Vector2();

}

export class LatchArt implements Art {

  constructor(latch: Latch) {
    this.latch = latch;
  }

  latch: Latch;

  layer = Layer.front;

  get part() {
    return this.latch;
  }

  get tile() {
    this.workPoint.set(20, 16);
    if (!this.latch.facing) {
      // Center facing. TODO Separate facing from state.
      this.workPoint.x -= 1;
    } else if (this.latch.facing < 0) {
      this.workPoint.x -= 2;
    }
    return this.workPoint;
  }

  workPoint = new Vector2();

}
