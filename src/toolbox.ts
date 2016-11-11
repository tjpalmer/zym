import {EditMode} from './';
import {Vector3} from 'three';

export class Toolbox {

  constructor(body: HTMLElement, edit: EditMode) {
    // Toolbox.
    this.container = body.querySelector('.toolbox') as HTMLElement;
    this.edit = edit;
    this.markSelected();
    let container = this.container;
    for (let input of container.querySelectorAll('input')) {
      input.addEventListener('click', () => {
        for (let other of this.getToolButtons()) {
          other.classList.remove('selected');
        }
        this.markSelected();
      });
    }
    // TODO Other panels.
  }

  container: HTMLElement;

  edit: EditMode;

  getToolButtons(): Array<HTMLElement> {
    return [...this.container.querySelectorAll('label')];
  }

  getToolName(button: HTMLElement) {
    return [...button.classList].filter(name => name != 'selected')[0];
  }

  markSelected() {
    let selected = this.container.querySelector('input:checked');
    let label = selected.closest('label') as HTMLElement;
    label.classList.add('selected');
    // Get the class name that's not selected.
    // TODO Instead put name on the input?
    let name = this.getToolName(label);
    this.edit.setToolFromName(name);
  }

}
