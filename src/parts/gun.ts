import {Biggie, Launcher, Runner} from './';
import {Game, Level, Part} from '../';
import {Vector2} from 'three';

export class Gun extends Part {

  constructor(game: Game) {
    super(game);
    this.shot = new Shot(game, this);
  }

  facing = 0;

  heroVisible() {
    let {point} = this;
    let {stage} = this.game;
    let {hero} = stage;
    if (!hero) {
      return false;
    }
    if (hero.point.y + 10 < point.y || hero.point.y > point.y + 10) {
      // Totally not vertically aligned. Skip.
      return false;
    }
    workPoint.set(4, 5).add(point);
    let step = this.facing * 8;
    while (workPoint.x > -10 && workPoint.x < 330) {
      workPoint.x += step;
      if (hero.contains(workPoint)) {
        return true;
      }
      if (stage.partAt(workPoint, part => part.solid(this))) {
        break;
      }
    }
    return false;
  }

  reset() {
    this.shot.active = false;
    this.game.stage.removed(this.shot);
  }

  get shootable() {
    return true;
  }

  get shotKillable() {
    return true;
  }

  shot: Shot;

  update() {
    let {shot} = this;
    let {stage} = this.game;
    if (this.dead) {
      return;
    }
    if (!shot.active && this.heroVisible()) {
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

  die() {
    this.active = false;
  }

  get exists() {
    return this.active;
  }

  gun: Gun;

  get shootable() {
    return true;
  }

  get shotKillable() {
    return true;
  }

  update() {
    let {game, gun} = this;
    let {facing} = gun;
    let {stage} = game;
    oldPoint.copy(this.point);
    this.point.x += 1.5 * facing;
    stage.moved(this, oldPoint);
    if (this.point.x < -10 || this.point.x > Level.pixelCount.x + 10) {
      this.active = false;
    }
    // Check for hits.
    // Only after really leaving the gun.
    if (this.partAt(4, 5, part => part == gun)) {
      return;
    }
    let parts = stage.partsNear(workPoint.set(4, 5).add(this.point));
    if (!parts) {
      return;
    }
    let hit: Part | undefined = undefined;
    for (let part of parts) {
      if (
        part != gun && part != this && part.shootable && !part.dead &&
        part.contains(workPoint)
      ) {
        if (hit) {
          // Hit the first thing.
          if (part.point.x * facing < hit!.point.x) {
            hit = part;
          }
        } else {
          hit = part;
        }
      }
    }
    if (hit) {
      this.active = false;
      if (hit.shotKillable) {
        hit.die(this);
      }
    }
  }

}

let oldPoint = new Vector2();

let workPoint = new Vector2();
