import {Game} from './';
import {Vector2} from 'three';

export class Control {

  constructor(game: Game) {
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

  burnLeft = false;

  burnRight = false;

  down = false;

  enter = false;

  // Double-press for these.
  // TODO fast = false;

  keyFields: {[key: string]: string} = {
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    Enter: 'enter',
    ' ': 'pause',
    X: 'burnRight',
    Z: 'burnLeft',
  };

  game: Game;

  left = false;

  onChange(fieldName: string) {
    switch (fieldName) {
      case 'enter': {
        if (this.enter) {
          this.game.edit.play();
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

  right = false;

  up = false;

}
