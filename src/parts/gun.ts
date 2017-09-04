import {Biggie, Launcher, Runner} from './index';
import {Game, Level, Part, RunnerAction} from '../index';
import {Vector2} from 'three';

export class Gun extends Runner {

  constructor(game: Game) {
    super(game);
    this.shot = new Shot(game, this);
  }

  // Never moves anywhere by choice, but eh.
  action = new RunnerAction();

  carried = true;

  carriedMove(x: number) {
    let {lastSupport, support} = this;
    if (
      support == lastSupport &&
      (support instanceof Biggie || support instanceof Gun)
    ) {
      if (support.facing && support.facing == -this.lastSupportFacing) {
        // This isn't really sufficient.
        // It should also change position relative to the support.
        // It's extra obvious when a biggie carries two guns side by side, and
        // yes this can happen.
        // Also, this should apply to everything, not just guns, but it's most
        // interesting for guns, so eh.
        this.facing = -this.facing;
      }
      this.lastSupportFacing = support.facing;
    } else {
      this.lastSupportFacing = 0;
    }
    this.lastSupport = support;
  }

  choose() {
    // Guns don't actually act, but we need falling dynamics.
    super.processAction(this.action);
  }

  facing = 0;

  heroVisible() {
    let {point} = this;
    let {stage} = this.game;
    let {hero} = stage;
    if (!hero || (hero.bonusSee && !this.seesInvisible)) {
      // TODO Let enemies see if near invisible?
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

  // Long before the start.
  lastShootTime = -100;

  lastSupport?: Part = undefined;

  lastSupportFacing = 0;

  speed = new Vector2(0.7, 0.7);

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

  surface(other: Part) {
    return other instanceof Gun;
  }

  update() {
    super.update();
    let {shot} = this;
    let {stage} = this.game;
    if (this.dead) {
      return;
    }
    // Min wait on shots recommended by Matt.
    let timeSince = stage.time - this.lastShootTime;
    if (!shot.active && timeSince > 2 && this.heroVisible()) {
      if (!shot.art) {
        this.game.theme.buildArt(shot);
      }
      shot.facing = this.facing;
      shot.active = true;
      shot.point.copy(this.point);
      stage.particles.push(shot);
      stage.added(shot);
      this.lastShootTime = stage.time;
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

  // Remember own facing in case gun changes facing.
  facing = 0;

  gun: Gun;

  get shootable() {
    return true;
  }

  get shotKillable() {
    return true;
  }

  update() {
    let {facing, game, gun} = this;
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
