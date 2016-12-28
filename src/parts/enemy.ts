import {Brick, None, Runner, TilePos, Treasure} from './';
import {Edge, Game, Part, RunnerAction} from '../';
import {Vector2} from 'three';

export class Enemy extends Runner {

  static char = 'e';

  action = new RunnerAction();

  avoidBottomless() {
    // Level design can still let enemies fall into steel traps or whatever, but
    // avoiding pits lets us more easily design floating island levels, which
    // seem cool at the moment.
    let {action, point: {y: myY}} = this;
    // Clear dangerous choices.
    if (action.down && this.bottomlessAt(4, -1)) {
      action.down = false;
    }
    if (action.left && this.bottomlessAt(-1, 0)) {
      action.left = false;
    }
    if (action.right && this.bottomlessAt(9, 0)) {
      action.right = false;
    }
  }

  bottomlessAt(x: number, y: number) {
    let {point: {y: myY}} = this;
    // Look from checkPoint down.
    while (y + myY >= 0) {
      if (this.partAt(x, y, part => part.type != None)) {
        // Something is here.
        return false;
      }
      y -= 10;
    }
    return true;
  }

  caught = false;

  chase() {
    let {action} = this;
    let {hero, time} = this.game.stage;
    if (hero) {
      let diff = this.workPoint2.copy(hero.point).sub(this.point);
      let closeX = Math.abs(diff.x) < close;
      let closeY = Math.abs(diff.y) < close;
      if (true) {
        // Because y moves are prioritized, just turn them on for control when
        // applicable.
        // TODO Keep y spacing like for x, too.
        if (diff.y < 0) {
          // Don't try to go down if we can't.
          // The problem is that if we're on a ladder with a solid at bottom, it
          // still tries to go down instead of left or right.
          let solidSurface =
            this.getSurface(part => part.solid(this, Edge.top));
          if (solidSurface) {
            // Well, also see if we have a climbable here.
            // The problem is if we have imperfect alignment with a ladder
            // between solids.
            // TODO Reusing calculations from action processing or physics could
            // TODO be nice.
            let climbable =
              (x: number) => this.partAt(x, -1, part => part.climbable);
            if (climbable(TilePos.midLeft) || climbable(TilePos.midRight)) {
              // Let climbable trump.
              solidSurface = undefined;
            }
          }
          if (!solidSurface) {
            if (!(closeY && this.closeTime(this.lastNotDown))) {
              action.down = true;
            }
          }
        } else {
          if (!(closeY && this.closeTime(this.lastNotUp))) {
            action.up = true;
          }
        }
      }
      if (true) {
        // TODO Watch for not running over pits.
        // Keep some spacing between enemies when possible.
        // See if all surfaces are enemies who are actually mobile.
        // TODO An enemy stuck in an ordinary hole should also count as caught!
        let isComrade = (part: Part) => part instanceof Enemy && !part.caught;
        let comradeSurface = this.getSurface(isComrade);
        let noncomradeSurface = this.getSurface(part => !isComrade(part));
        let surface = comradeSurface && !noncomradeSurface;
        if (diff.x < 0) {
          if (!(this.getOther(-8, 4) || surface)) {
            if (!(closeX && this.closeTime(this.lastNotLeft))) {
              action.left = true;
            }
          }
        } else {
          if (!(this.getOther(16, 4) || surface)) {
            if (!(closeX && this.closeTime(this.lastNotRight))) {
              action.right = true;
            }
          }
        }
      }
    }
  }

  choose() {
    this.clearAction();
    if (!this.caught) {
      this.chase();
    }
    this.avoidBottomless();
    this.rememberActionTimes();
    this.processAction(this.action);
  }

  clearAction() {
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
  }

  closeTime(baseTime: number) {
    // Use abs in case of time wrapping. TODO Really? Reset time at play start?
    return Math.abs(this.game.stage.time - baseTime) < closeTime;
  }

  getOther(x: number, y: number) {
    let isEnemy = (part: Part) => part instanceof Enemy && part != this;
    return this.partAt(x, y, isEnemy);
  }

  lastNotDown = 0;

  lastNotLeft = 0;

  lastNotRight = 0;

  lastNotUp = 0;

  rememberActionTimes() {
    if (!this.action.down) {
      this.lastNotDown = this.game.stage.time;
    }
    if (!this.action.left) {
      this.lastNotLeft = this.game.stage.time;
    }
    if (!this.action.right) {
      this.lastNotRight = this.game.stage.time;
    }
    if (!this.action.up) {
      this.lastNotUp = this.game.stage.time;
    }
  }

  solid(other: Part, edge?: Edge): boolean {
    // Enemies block entrance to each other, but not exit from.
    // Just a touch of safety precaution.
    return other instanceof Enemy && !!edge;
  }

  // TODO They still get stuck when clumped in hordes after making this
  // TODO non-integer.
  // TODO Fix this sometime.
  speed = 0.7;

  surface = true;

  take(treasure: Treasure) {
    if (this.treasure) {
      return false;
    } else {
      this.treasure = treasure;
      return true;
    }
  }

  treasure?: Treasure = undefined;

  update() {
    let catcher = this.getCatcher();
    if (catcher instanceof Brick) {
      // No moving in bricks.
      this.move.setScalar(0);
      this.caught = true;
      // Lose treasure if we have one.
      let {treasure} = this;
      if (treasure) {
        this.treasure = undefined;
        treasure.owner = undefined;
        treasure.point.copy(this.point);
        // Place it above.
        treasure.point.y += 10;
      }
    }
    let hero = this.game.stage.hero;
    if (hero) {
      this.workPoint.copy(this.point).add(this.workPoint2.set(4, 5));
      if (hero.contains(this.workPoint)) {
        hero.dead = true;
      }
    }
    super.update();
  }

  workPoint2 = new Vector2();

}

let close = 4;

let closeTime = 1;
