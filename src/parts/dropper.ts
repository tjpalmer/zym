import {Edge, Game, Level, Part, RunnerAction} from '../';
import {Hero, Runner} from './';
import {Vector2} from 'three';

export class Dropper extends Part {

  static char = 'Y';

  constructor(game: Game) {
    super(game);
    this.drop = new Drop(game);
  }

  drop: Drop;

  lastDropTime = 0;

  get shootable() {
    return true;
  }

  get shotKillable() {
    return true;
  }

  solid(other: Part, edge?: Edge) {
    return edge == Edge.top;
  }

  surface() {
    return true;
  }

  update() {
    let {drop} = this;
    let {stage} = this.game;
    if (this.dead) {
      return;
    }
    if (stage.time < 0.01) {
      workPoint2.copy(this.point).divide(Level.tileSize).floor();
      this.lastDropTime =
        (workPoint2.x + workPoint2.y * Level.tileCount.x) % 3;
    }
    let timeSince = stage.time - this.lastDropTime;
    if (!drop.active && timeSince > 3) {
      if (!drop.art) {
        this.game.theme.buildArt(drop);
      }
      drop.active = true;
      drop.point.copy(this.point);
      drop.stopTime = 0;
      stage.particles.push(drop);
      stage.added(drop);
      this.lastDropTime = stage.time;
    }
  }

}

export class Drop extends Runner {

  // Never moves anywhere by choice, but eh.
  action = new RunnerAction();

  active = false;

  choose() {
    // Just for falling and such.
    super.processAction(this.action);
  }

  climber = false;

  die() {
    this.active = false;
  }

  get exists() {
    return this.active;
  }

  get fadeTime() {
    return 0.2;
  }

  get shootable() {
    return true;
  }

  speed = new Vector2(0.8, 0.8);

  stopTime = 0;

  update() {
    let {stopTime} = this;
    let {hero, time} = this.game.stage;
    super.update()
    // Kill.
    if (hero && !this.dead) {
      this.workPoint.copy(this.point).add(workPoint2.set(4, 5));
      if (hero.contains(this.workPoint)) {
        hero.die();
      }
    }
    // Die.
    // TODO After fading!
    if (!this.moved.y) {
      if (!stopTime) {
        this.stopTime = time;
      }
    }
    if (this.point.y < -10 || (stopTime && time - stopTime > this.fadeTime)) {
      this.die();
    }
  }

}

let workPoint2 = new Vector2();
