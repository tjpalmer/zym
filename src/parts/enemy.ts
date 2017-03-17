import {Biggie, Bonus, Brick, Hero, None, Prize, Runner, TilePos} from './';
import {Edge, Game, Level, Part, RunnerAction} from '../';
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
    if (action.down && (
        this.bottomlessAt(TilePos.midLeft, -1) ||
        this.bottomlessAt(TilePos.midRight, -1)
    )) {
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
      if (this.partAt(x, y, part =>
        part.catches(this) || part.surface(this, true)
      )) {
        // Something is here.
        return false;
      }
      y -= 10;
    }
    return true;
  }

  catcher: Part | undefined = undefined;

  caughtTime = 0;

  chase() {
    // Using last intended move was for cases of falling not looking like going
    // down, but it interfered with coming up off ladder then going right into
    // ladder needing to go up.
    let {action, moved, state, waitPoint, waitPointHero, waitTime} = this;
    let {hero, time} = this.game.stage;
    if (!hero) {
      return;
    }
    // TODO Using oldDiff also causes the top of ladder problem, but worse.
    // let oldDiff = this.workPoint2.copy(hero.oldPoint).sub(this.oldPoint);
    let diff = this.workPoint2.copy(hero.point).sub(this.point);
    // TODO Wander state?
    // TODO Change state based on failure to move in intended direction?
    // TODO Unify x and y commonality.
    switch (state.y) {
      case State.chase: {
        if (Math.sign(diff.y) == -Math.sign(moved.y)) {
          this.state.y = State.wait;
          waitPoint.x = this.point.x;
          waitPointHero.y = hero.point.y;
          waitTime.y = time + closeTime;
        } else if (diff.y) {
          if (diff.y < 0) {
            // Don't try to go down if we can't.
            // The problem is that if we're on a ladder with a solid at
            // bottom, it still tries to go down instead of left or right.
            let solidSurface =
              this.getSurface(part => part.solid(this, Edge.top, true), true);
            if (solidSurface) {
              // Well, also see if we have a climbable here.
              // The problem is if we have imperfect alignment with a ladder
              // between solids.
              // TODO Reusing calculations from action processing or physics
              // TODO could be nice.
              let climbable = (x: number) =>
                this.partAt(x, -1, part => part.climbable(this));
              if (climbable(TilePos.midLeft) || climbable(TilePos.midRight)) {
                // Let climbable trump.
                solidSurface = undefined;
              }
            }
            if (!solidSurface) {
              action.down = true;
            }
          } else {
            let ceiling =
              this.getSolid(Edge.bottom, TilePos.midLeft, 10, true) ||
              this.getSolid(Edge.bottom, TilePos.midRight, 10, true);
            if (!ceiling) {
              action.up = true;
            }
          }
        }
        break;
      }
      case State.wait:
      case State.wanderNeg:
      case State.wanderPos: {
        if (state.y == State.wanderNeg) {
          action.down = true;
        } else if (state.y == State.wanderPos) {
          action.up = true;
        }
        let waitDiff = Math.abs(this.point.x - this.waitPoint.x);
        let waitDiffHero = Math.abs(hero.point.y - this.waitPointHero.y);
        if (waitDiff >= Level.tileSize.x || waitDiffHero >= Level.tileSize.y) {
          state.y = State.chase;
        } else if (time >= waitTime.y) {
          if (state.y == State.wait) {
            state.y = this.lastWander.y > 0 ? State.wanderNeg : State.wanderPos;
            this.lastWander.y = -this.lastWander.y;
          } else {
            state.y = State.wait;
          }
          waitTime.y = time + closeTime;
        }
        break;
      }
    }
    switch (state.x) {
      case State.chase: {
        if (Math.sign(diff.x) == -Math.sign(moved.x)) {
          this.state.x = State.wait;
          waitPoint.y = this.point.y;
          waitPointHero.x = hero.point.x;
          waitTime.x = time + closeTime;
        } else if (diff.x) {
          // TODO Watch for not running over pits.
          // Keep some spacing between enemies when possible.
          // See if all surfaces are enemies who are actually mobile.
          // TODO An enemy stuck in an ordinary hole should also count as
          // TODO caught!
          let isComrade = (part: Part) =>
            part instanceof Enemy && !part.catcher && !part.dead;
          let comradeSurface = this.getSurface(isComrade);
          let noncomradeSurface = this.getSurface(part => !isComrade(part));
          let surface = comradeSurface && !noncomradeSurface;
          if (diff.x < 0) {
            if (!(this.getOther(-8, 4) || surface)) {
              action.left = true;
            }
          } else if (diff.x > 0) {
            if (!(this.getOther(16, 4) || surface)) {
              action.right = true;
            }
          }
        }
        break;
      }
      case State.wait:
      case State.wanderNeg:
      case State.wanderPos: {
        if (state.x == State.wanderNeg) {
          action.left = true;
        } else if (state.x == State.wanderPos) {
          action.right = true;
        }
        let waitDiff = Math.abs(this.point.y - this.waitPoint.y);
        let waitDiffHero = Math.abs(hero.point.x - this.waitPointHero.x);
        if (waitDiff >= Level.tileSize.y || waitDiffHero >= Level.tileSize.x) {
          state.x = State.chase;
        } else if (time >= waitTime.x) {
          if (state.x == State.wait) {
            state.x = this.lastWander.x > 0 ? State.wanderNeg : State.wanderPos;
            this.lastWander.x = -this.lastWander.x;
          } else {
            state.x = State.wait;
          }
          waitTime.x = time + closeTime;
        }
        break;
      }
    }
    if (action.left || action.right) {
      // Don't walk into seeming walls. TODO Exact alignment against such?
      let x = action.left ? -this.speed.x : 8 + this.speed.x;
      let edge = action.left ? Edge.right : Edge.left;
      let wall = this.partAt(x, 0, part => part.solid(this, edge, true));
      if (wall) {
        action.left = action.right = false;
      }
    }
  }

  choose() {
    this.action.clear();
    if (!(this.dazed || this.dead)) {
      if (this.game.stage.hero) {
        this.chase();
      }
      if (this.catcher) {
        // Don't go down, and if still caught, go up.
        this.action.down = false;
        if (this.feetInCatcher()) {
          this.action.up = true;
        }
      }
    }
    this.avoidBottomless();
    this.processAction(this.action);
  }

  closeTime(baseTime: number) {
    // Use abs in case of time wrapping. TODO Really? Reset time at play start?
    return Math.abs(this.game.stage.time - baseTime) < closeTime;
  }

  dazed = false;

  die() {
    super.die();
    this.climber = false;
    this.releaseTreasure();
  }

  feetInCatcher() {
    let isCatcher = (part: Part) => part == this.catcher;
    return (
      this.partAt(0, 0, isCatcher) ||
      this.partAt(0, -1, isCatcher) ||
      this.partAt(TilePos.right, 0, isCatcher) ||
      this.partAt(TilePos.right, -1, isCatcher)
    );
  }

  get keyTime() {
    // Indicate when holding a prize.
    return this.prize ? this.game.stage.time : -10;
  }

  set keyTime(value: number) {
    // Ignore.
  }

  getOther(x: number, y: number) {
    let isEnemy = (part: Part) =>
      part instanceof Enemy && part != this && !part.dead;
    return this.partAt(x, y, isEnemy);
  }

  lastWander = new Vector2(1, 1);

  prize?: Prize = undefined;

  releaseTreasure() {
    let {prize} = this;
    if (prize) {
      if (prize instanceof Bonus) {
        this.speed.divideScalar(1.5);
      }
      this.prize = undefined;
      prize.owner = undefined;
      prize.point.copy(this.point);
      // Place it above.
      // TODO Only above if center in brick! Otherwise go to center!
      if (this.partAt(4, 5, part => part instanceof Brick)) {
        // If our center is in a brick, look up.
        prize.point.y += 10;
      }
      // Align vertically on grid.
      prize.point.y = Math.round(prize.point.y / 10) * 10;
    }
  }

  solid(other: Part, edge?: Edge): boolean {
    // Enemies block entrance to each other, but not exit from.
    // Just a touch of safety precaution.
    return other instanceof Enemy && !other.dead && !!edge;
  }

  // TODO They still get stuck when clumped in hordes after making this
  // TODO non-integer.
  // TODO Fix this sometime.
  speed = new Vector2(0.7, 0.7);

  state = {x: State.chase, y: State.chase};

  surface(other: Part) {
    return other instanceof Enemy || other instanceof Hero;
  }

  take(prize: Prize) {
    if (this.dead || this.prize) {
      return false;
    } else {
      this.prize = prize;
      if (prize instanceof Bonus) {
        this.speed.multiplyScalar(1.5);
      }
      return true;
    }
  }

  update() {
    let catcher = this.getCatcher();
    if (
      catcher instanceof Brick &&
      // Require alignment in case of horizontal entry.
      Math.abs(this.point.x - catcher.point.x) < 1
    ) {
      // No horizontal moving in bricks.
      this.point.x = catcher.point.x;
      this.move.x = 0;
      if (!this.catcher) {
        this.catcher = catcher;
        this.caughtTime = this.game.stage.time;
        this.dazed = true;
      }
      // Lose treasure if we have one.
      this.releaseTreasure();
    } else if (this.catcher) {
      let isCatcher = (part: Part) => part == this.catcher;
      if (this.catcher instanceof Brick && !this.catcher.burned) {
        this.catcher = undefined;
      } else if (!this.feetInCatcher()) {
        this.catcher = undefined;
      }
    }
    if (this.dazed) {
      if (this.caughtTime < this.game.stage.time - 1.4) {
        this.dazed = false;
      } else {
        this.move.setScalar(0);
      }
    }
    let hero = this.game.stage.hero;
    if (hero && !this.dead) {
      this.workPoint.copy(this.point).add(this.workPoint2.set(4, 5));
      if (hero.contains(this.workPoint)) {
        hero.die();
      }
    }
    super.update();
    // Check stuckness.
    let {time} = this.game.stage;
    if (
      (time > this.waitTime.x || time > this.waitTime.y) &&
      (this.state.x == State.chase && this.state.y == State.chase) &&
      !(this.moved.x || this.moved.y)
    ) {
      this.state.x = this.state.y = State.wait;
      this.waitTime.y = this.game.stage.time + closeTime;
      this.waitTime.x = this.game.stage.time + 1.1 * closeTime;
      this.waitPoint.copy(this.point);
      if (this.game.stage.hero) {
        this.waitPointHero.copy(this.game.stage.hero.point);
      }
    }
  }

  waitPoint = new Vector2();

  waitPointHero = new Vector2();

  waitTime = new Vector2();

  workPoint2 = new Vector2();

}

enum State {
  chase,
  wanderNeg,
  wanderPos,
  wait,
}

let closeTime = 2;
