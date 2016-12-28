import {Game} from './';
import {Vector2} from 'three';

export class RunnerAction {

  // TODO Simplify this down to what's possible?

  burnLeft = false;

  burnRight = false;

  // copy(action: RunnerAction) {
  //   this.burnLeft = action.burnLeft;
  //   this.burnRight = action.burnRight;
  //   this.down = action.down;
  //   this.left = action.left;
  //   this.right = action.right;
  //   this.up = action.up;
  // }

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

  keyAction = new RunnerAction();

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
        if ((this.keyAction as any)[field] != null) {
          (this.keyAction as any)[field] = down;
        }
        this.onChange(field);
      }
      event.preventDefault();
      // console.log(`Set ${field} to ${down}`);
    }
  }

  padAction = new RunnerAction();

  readPad(pad: Gamepad) {
    let {padAction: action} = this;
    let {axes, buttons} = pad;
    action.burnLeft =
      buttons[0].pressed || buttons[2].pressed || buttons[4].pressed ||
      buttons[6].pressed;
    action.burnRight =
      buttons[1].pressed || buttons[3].pressed || buttons[5].pressed ||
      buttons[7].pressed;
    action.down =
      axes[1] > axisEdge || axes[3] > axisEdge || buttons[13].pressed;
    action.left =
      axes[0] < -axisEdge || axes[2] < -axisEdge || buttons[14].pressed;
    action.right =
      axes[0] > axisEdge || axes[2] > axisEdge || buttons[15].pressed;
    action.up =
      // Up is negative.
      axes[1] < -axisEdge || axes[3] < -axisEdge || buttons[12].pressed;
    // Apply either/or.
    this.burnLeft = this.keyAction.burnLeft || action.burnLeft;
    this.burnRight = this.keyAction.burnRight || action.burnRight;
    this.down = this.keyAction.down || action.down;
    this.left = this.keyAction.left || action.left;
    this.right = this.keyAction.right || action.right;
    this.up = this.keyAction.up || action.up;
    // Change trackers.
    let enter = buttons[8].pressed;
    if (enter != this.enter) {
      this.enter = enter;
      this.onChange('enter');
    }
    let pause = buttons[9].pressed;
    if (pause != this.pause) {
      this.pause = pause;
      this.onChange('pause');
    }
  }

  pause = false;

  update() {
    let pads = window.navigator.getGamepads();
    if (pads && pads.length > 0 && pads[0] && pads[0].mapping == 'standard') {
      this.readPad(pads[0]);
    }
  }

}

let axisEdge = 0.5;
