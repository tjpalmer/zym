import {Game} from './index';
import {Vector2} from 'three';

export class RunnerAction {

  burnLeft = false;

  burnRight = false;

  active() {
    return (
      this.burnLeft || this.burnRight ||
      this.down || this.left || this.right || this.up
    );
  }

  clear() {
    this.burnLeft = this.burnRight = false;
    this.left = this.right = this.up = this.down = false;
  }

  copy(action: RunnerAction) {
    this.burnLeft = action.burnLeft;
    this.burnRight = action.burnRight;
    this.down = action.down;
    this.left = action.left;
    this.right = action.right;
    this.up = action.up;
  }

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

  onDown(fieldName: string) {
    switch (fieldName) {
      case 'burnLeft':
      case 'burnRight': {
        if (this.game.stage.ended) {
          this.game.mode.onKeyDown('Enter');
          this.game.hideDialog();
        }
        break;
      }
      case 'enter': {
        this.game.mode.onKeyDown('Enter');
        this.game.hideDialog();
        break;
      }
      case 'escape': {
        let wasShowing = this.game.showingDialog();
        this.game.mode.onKeyDown('Escape');
        if (wasShowing) {
          this.game.hideDialog();
        }
        break;
      }
      case 'pause': {
        this.game.play.togglePause();
        break;
      }
    }
  }

  onField(field: string, down: boolean) {
    let old = (this as any)[field];
    if (old != down) {
      (this as any)[field] = down;
      if ((this as any)[field] != null) {
        (this as any)[field] = down;
      }
      if (down) {
        this.onDown(field);
      }
      // console.log(`Set ${field} to ${down}`);
    }
  }

  onKey(event: KeyboardEvent, down: boolean) {
    // console.log(event.key);
    let field = this.keyFields[event.key];
    // Let 'escape' be global because that's already handled well enough.
    if (this.game.showingDialog() && field != 'escape') {
      if (this.game.dialog) {
        this.game.dialog.onKey(event, down);
      }
      return;
    }
    if (field) {
      (this.keyAction as any)[field] = down;
      this.onField(field, down);
      event.preventDefault();
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
    this.onField('burnLeft', this.keyAction.burnLeft || action.burnLeft);
    this.onField('burnRight', this.keyAction.burnRight || action.burnRight);
    this.down = this.keyAction.down || action.down;
    this.left = this.keyAction.left || action.left;
    this.right = this.keyAction.right || action.right;
    this.up = this.keyAction.up || action.up;
    // Change trackers.
    this.onField('enter', buttons[8].pressed);
    this.onField('pause', buttons[9].pressed);
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
