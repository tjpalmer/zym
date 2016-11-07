import {Game} from './';
import {Vector2} from 'three';

export class Control {

  constructor(game: Game) {
    this.active = false;
    // this.last = new Vector2();
    this.game = game;
    // let canvas = game.renderer.domElement;
    // canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
    // window.addEventListener('mouseup', event => this.mouseUp(event));
  }

  active: boolean;

  mouseDown(event: MouseEvent) {
    this.active = true;
  }

  mouseMove(event: MouseEvent) {
    if (!this.active) return;
    this.update();
  }

  mouseUp(event: MouseEvent) {
    this.active = false;
  }

  game: Game;

  update() {
    // this.game.render();
  }

}
