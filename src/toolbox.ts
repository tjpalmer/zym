import {Stage} from './';
import {Vector3} from 'three';

export class Toolbox {

  constructor(body: HTMLElement, stage: Stage) {
    // Toolbox.
    let toolbox = body.querySelector('.toolbox');
    for (let any of <any>toolbox.querySelectorAll('input')) {
      let input: HTMLInputElement = any;
      input.addEventListener('click', () => {
        for (let any of <any>toolbox.querySelectorAll('label')) {
          let other: HTMLInputElement = any;
          other.classList.remove('selected');
        }
        let selected = toolbox.querySelector('input:checked');
        (<HTMLElement>selected.closest('label')).classList.add('selected');
      });
    }
    // TODO Other panels.
  }

}
