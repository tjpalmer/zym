import {Mode} from './';

export class PlayMode extends Mode {

  tick() {
    this.game.stage.tick();
  }

}
