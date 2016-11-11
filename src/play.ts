import {Game, Mode} from './';

export class PlayMode extends Mode {

  constructor(game: Game) {
    super(game);
    this.onClick('pause', () => this.togglePause());
    // TODO Different handling (and visual display) of stop when really playing? 
    this.onClick('stop', () => this.game.edit.play());
  }

  paused = false;

  tick() {
    if (this.paused) {
      // No updates. TODO Any juice for paused mode?
      return;
    }
    this.game.stage.tick();
  }

  togglePause() {
    this.paused = !this.paused;
    this.toggleClasses({
      element: this.getButton('pause'),
      falseClass: 'fa-pause', trueClass: 'fa-play',
      value: this.paused,
    });
  }

}
