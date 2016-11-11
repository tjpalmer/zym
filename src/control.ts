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

  // Double-press for these.
  // TODO fast = false;

  keyFields: {[key: string]: string} = {
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    X: 'burnRight',
    Z: 'burnLeft',
  };

  game: Game;

  left = false;

  onKey(event: KeyboardEvent, down: boolean) {
    // console.log(event.key);
    let field = this.keyFields[event.key];
    if (field) {
      (this as any)[field] = down;
      event.preventDefault();
      // console.log(`Set ${field} to ${down}`);
    }
  }

  right = false;

  up = false;

}
