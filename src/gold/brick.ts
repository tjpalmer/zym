import {BaseArt, Layer} from './index';
import {Game, Part} from '../index';
import {Brick} from '../parts/index';
import {Vector2} from 'three';

export class BrickArt extends BaseArt<Brick> {

  constructor(part: Brick) {
    super(part);
    this.flame = new Flame(part);
  }

  flame: Flame;

  frame = 10;

  layer = Layer.front;

  get tile() {
    // TODO Additional translucent full brick even when burned?!?
    let {burned, burnTime, burnTimeLeft} = this.part;
    if (burned) {
      if (this.flame.exists && !this.flame.started) {
        this.flame.start();
      }
      workPoint.copy(mainTile);
      let frame = 10;
      if (burnTime < animTime) {
        frame = Math.floor((burnTime / animTime) * animCount);
      } else if (burnTimeLeft < animTime) {
        frame = Math.floor((burnTimeLeft / animTime) * animCount);
      }
      frame = Math.max(frame, 0);
      workPoint.y -= frame;
      this.frame = frame;
      return workPoint;
    } else {
      return mainTile;
    }
  }

}

export class Flame extends Part {

  constructor(brick: Brick) {
    super(brick.game);
    this.brick = brick;
    this.game.theme.buildArt(this);
  }

  brick: Brick;

  get exists() {
    let {brick} = this;
    let brickArt = brick.art as BrickArt;
    let exists = brick.burnTime < animTime;
    if (!exists) {
      this.started = false;
    }
    return exists;
  }

  start() {
    let {stage} = this.game;
    stage.particles.push(this);
    stage.added(this);
    this.point.set(0, 10).add(this.brick.point);
    this.started = true;
  }

  started = false;

  update() {
    let {brick} = this;
    let brickArt = brick.art as BrickArt;
    this.point.set(0, 10 - brickArt.frame).add(this.brick.point);
  }

}

export class FlameArt extends BaseArt<Flame> {

  layer = Layer.flame;

  get tile() {
    let frame = (this.part.brick.art as BrickArt).frame;
    frame = 9 - Math.max(0, Math.min(frame, 9));
    flameTile.set(3, 10);
    if (frame < 5) {
      flameTile.x += 1;
    }
    flameTile.y += frame % 5;
    return flameTile;
  }

}

let animCount = 10;

let animTime = 0.25;

let flameTile = new Vector2();

let mainTile = new Vector2(2, 18);

let workPoint = new Vector2();
