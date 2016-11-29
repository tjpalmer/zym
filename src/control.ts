import {Game} from './';
import {Vector2} from 'three';

export class RunnerAction {

  // TODO Simplify this down to what's possible?

  burnLeft = false;

  burnRight = false;

  down = false;

  // Double-press for these.
  // TODO fast = false;

  left = false;

  right = false;

  up = false;

}

export class Control extends RunnerAction {

  constructor(game: Game) {
    super();
    this.game = game;
    // TODO Capture below window level?
    window.addEventListener('keydown', event => this.onKey(event, true));
    window.addEventListener('keyup', event => this.onKey(event, false));
    // Store both cases for letter keys.
    Object.keys(this.keyFields).forEach(key => {
      if (key.length == 1) {
        this.keyFields[key.toLowerCase()] = this.keyFields[key];
      }
    });
  }

  enter = false;

  escape = false;

  keyFields: {[key: string]: string} = {
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    Enter: 'enter',
    Escape: 'escape',
    ' ': 'pause',
    X: 'burnRight',
    Z: 'burnLeft',
  };

  game: Game;

  onChange(fieldName: string) {
    switch (fieldName) {
      case 'enter': {
        if (this.enter) {
          this.game.edit.play();
        }
        break;
      }
      case 'escape': {
        if (this.escape) {
          // TODO Some convenience on this.
          let pane = this.game.body.querySelector('.pane') as HTMLElement;
          let style = window.getComputedStyle(pane);
          if (style.display == 'none') {
            // TODO Generalize to whatever context dialog makes most sense.
            this.game.edit.showLevels();
          } else {
            this.game.hideDialog();
          }
        }
        break;
      }
      case 'pause': {
        if (this.pause) {
          this.game.play.togglePause();
        }
        break;
      }
    }
  }

  onKey(event: KeyboardEvent, down: boolean) {
    // console.log(event.key);
    let field = this.keyFields[event.key];
    if (field) {
      let old = (this as any)[field];
      if (old != down) {
        (this as any)[field] = down;
        this.onChange(field);
      }
      event.preventDefault();
      // console.log(`Set ${field} to ${down}`);
    }
  }

  pause = false;

}
