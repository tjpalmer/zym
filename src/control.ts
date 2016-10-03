import {Stage} from './';
import {Vector2} from 'three';

export class Control {

  constructor(stage: Stage) {
    this.active = false;
    // this.last = new Vector2();
    this.stage = stage;
    // let canvas = stage.renderer.domElement;
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

  stage: Stage;

  update() {
    // this.stage.render();
  }

}
