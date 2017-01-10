import {Game, Level, Part} from '../';
import {Vector2} from 'three';

export class Gun extends Part {

  constructor(game: Game) {
    super(game);
    this.shot = new Shot(game, this);
  }

  facing = 0;

  reset() {
    this.shot.active = false;
    this.game.stage.removed(this.shot);
  }

  shot: Shot;

  update() {
    let {shot} = this;
    let {stage} = this.game;
    if (!shot.active) {
      if (!shot.art) {
        this.game.theme.buildArt(shot);
      }
      shot.active = true;
      shot.point.copy(this.point);
      stage.particles.push(shot);
      stage.added(shot);
    }
  }

}

export class GunLeft extends Gun {

  static char = '{';

  facing = -1;

}

export class GunRight extends Gun {

  static char = '}';

  facing = 1;

}

export class Shot extends Part {

  // No char because shots are entirely dynamic.

  constructor(game: Game, gun: Gun) {
    super(game);
    this.gun = gun;
  }

  active = false;

  get exists() {
    return this.active;
  }

  gun: Gun;

  update() {
    oldPoint.copy(this.point);
    this.point.x += 1.5 * this.gun.facing;
    this.game.stage.moved(this, oldPoint);
    if (this.point.x < -10 || this.point.x > Level.pixelCount.x + 10) {
      this.active = false;
    }
  }

}

let oldPoint = new Vector2();
