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
      if (this.partAt(x, y, part => part.type != None)) {
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
    let {action, moved: lastMove, state, waitTime} = this;
    let {hero, time} = this.game.stage;
    if (hero) {
      let diff = this.workPoint2.copy(hero.point).sub(this.point);
      // TODO Wander state?
      // TODO Change state based on failure to move in intended direction?
      // TODO Unify x and y commonality.
      switch (state.y) {
        case State.chase: {
          if (Math.sign(diff.y) == -Math.sign(lastMove.y)) {
            this.state.y = State.wait;
            waitTime.y = time + closeTime;
          } else if (diff.y) {
            if (diff.y < 0) {
              // Don't try to go down if we can't.
              // The problem is that if we're on a ladder with a solid at
              // bottom, it still tries to go down instead of left or right.
              let solidSurface =
                this.getSurface(part => part.solid(this, Edge.top));
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
              // TODO Check for solid bottom at the top of a ladder.
              let ceiling =
                this.getSolid(Edge.bottom, TilePos.midLeft, 10) ||
                this.getSolid(Edge.bottom, TilePos.midRight, 10);
              if (!ceiling) {
                action.up = true;
              }
            }
          }
          break;
        }
        case State.wait: {
          if (time >= waitTime.y) {
            state.y = State.chase;
          }
          break;
        }
      }
      switch (state.x) {
        case State.chase: {
          if (Math.sign(diff.x) == -Math.sign(lastMove.x)) {
            this.state.x = State.wait;
            waitTime.x = time + closeTime;
          } else if (diff.x) {
            // TODO Watch for not running over pits.
            // Keep some spacing between enemies when possible.
            // See if all surfaces are enemies who are actually mobile.
            // TODO An enemy stuck in an ordinary hole should also count as
            // TODO caught!
            let isComrade =
              (part: Part) => part instanceof Enemy && !part.catcher;
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
        case State.wait: {
          if (time >= waitTime.x) {
            state.x = State.chase;
          }
          break;
        }
      }
    }
  }

  choose() {
    this.clearAction();
    if (!(this.dazed || this.dead)) {
      this.chase();
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
    // Intended move, not actual.
    this.lastMove.x = this.action.left ? -1 : this.action.right ? 1 : 0;
    this.lastMove.y = this.action.down ? -1 : this.action.up ? 1 : 0;
  }

  clearAction() {
    let {action} = this;
    action.left = action.right = action.up = action.down = false;
  }

  closeTime(baseTime: number) {
    // Use abs in case of time wrapping. TODO Really? Reset time at play start?
    return Math.abs(this.game.stage.time - baseTime) < closeTime;
  }

  dazed = false;

  feetInCatcher() {
    let isCatcher = (part: Part) => part == this.catcher;
    return (
      this.partAt(0, 0, isCatcher) ||
      this.partAt(0, -1, isCatcher) ||
      this.partAt(TilePos.right, 0, isCatcher) ||
      this.partAt(TilePos.right, -1, isCatcher)
    );
  }

  getOther(x: number, y: number) {
    let isEnemy = (part: Part) => part instanceof Enemy && part != this;
    return this.partAt(x, y, isEnemy);
  }

  lastMove = new Vector2();

  solid(other: Part, edge?: Edge): boolean {
    // Enemies block entrance to each other, but not exit from.
    // Just a touch of safety precaution.
    return other instanceof Enemy && !!edge;
  }

  // TODO They still get stuck when clumped in hordes after making this
  // TODO non-integer.
  // TODO Fix this sometime.
  speed = 0.7;

  state = {x: State.chase, y: State.chase};

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
      // No horizontal moving in bricks.
      this.move.x = 0;
      if (!this.catcher) {
        this.catcher = catcher;
        this.caughtTime = this.game.stage.time;
        this.dazed = true;
      }
      // Lose treasure if we have one.
      let {treasure} = this;
      if (treasure) {
        this.treasure = undefined;
        treasure.owner = undefined;
        treasure.point.copy(this.point);
        // Place it above.
        treasure.point.y += 10;
      }
    } else if (this.catcher) {
      let isCatcher = (part: Part) => part == this.catcher;
      if (this.catcher instanceof Brick && !this.catcher.burned) {
        this.catcher = undefined;
      } else if (!this.feetInCatcher()) {
        this.catcher = undefined;
      }
    }
    if (this.dazed) {
      if (this.caughtTime < this.game.stage.time - 3) {
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
  }

  waitTime = new Vector2();

  workPoint2 = new Vector2();

}

enum State {
  chase,
  wander,
  wait,
}

let closeTime = 0.5;
