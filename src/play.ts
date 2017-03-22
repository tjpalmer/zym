import {Game, Mode} from './';
import {Report} from './ui';

export class PlayMode extends Mode {

  constructor(game: Game) {
    super(game);
    this.onClick('pause', () => this.togglePause());
    // TODO Different handling (and visual display) of stop when really playing? 
    this.onClick('stop', () => this.game.edit.togglePlay());
  }

  bodyClass = 'playMode';

  enter() {
    this.game.play.starting = true;
    // Sometimes things get confused, and clearing the action might help.
    // We can't directly read keyboard state.
    this.game.control.clear();
    this.game.control.keyAction.clear();
  }

  paused = false;

  showReport(message: string) {
    this.game.showDialog(new Report(this.game, message));
  }

  tick() {
    if (this.starting) {
      if (this.game.control.active()) {
        this.starting = false;
      }
    }
    if (this.paused || this.starting) {
      // No updates. TODO Any juice for paused mode?
      return;
    }
    this.game.stage.tick();
  }

  starting = true;

  timeElement: HTMLElement;

  togglePause() {
    this.paused = !this.paused;
    this.toggleClasses({
      element: this.getButton('pause'),
      falseClass: 'fa-pause', trueClass: 'fa-play',
      value: this.paused,
    });
  }

}
