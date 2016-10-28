import {Stage} from './';
import {Vector3} from 'three';

export class Toolbox {

  constructor(body: HTMLElement, stage: Stage) {
    // Toolbox.
    this.container = <HTMLElement>body.querySelector('.toolbox');
    this.markSelected();
    let container = this.container;
    for (let any of <any>container.querySelectorAll('input')) {
      let input: HTMLInputElement = any;
      input.addEventListener('click', () => {
        for (let any of <any>container.querySelectorAll('label')) {
          let other: HTMLInputElement = any;
          other.classList.remove('selected');
        }
        this.markSelected();
      });
    }
    // TODO Other panels.
  }

  container: HTMLElement;

  markSelected() {
    let selected = this.container.querySelector('input:checked');
    let label = <HTMLElement>selected.closest('label');
    label.classList.add('selected');
    // Get the class name that's not selected.
    // TODO Instead put name on the input?
    this.selected = [...label.classList].filter(name => name != 'selected')[0];
    console.log(this.selected);
  }

  selected: string;

}
