import {Biggie, Runner} from './';
import {Game, Level, Part} from '../';
import {Vector2} from 'three';

export class Gun extends Part {

  constructor(game: Game) {
    super(game);
    this.shot = new Shot(game, this);
  }

  dead = false;

  die() {
    this.dead = true;
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
    if (this.dead) {
      return;
    }
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
        part != gun &&
        (
          ((part instanceof Gun || part instanceof Runner) && !part.dead) ||
          part.solid(this)
        ) &&
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
      if (
        hit instanceof Gun ||
        (hit instanceof Runner && !(hit instanceof Biggie))
      ) {
        hit.die();
      }
    }
  }

}

let oldPoint = new Vector2();

let workPoint = new Vector2();
