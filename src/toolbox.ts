import {EditMode} from './';
import {Vector3} from 'three';

export class Toolbox {

  constructor(body: HTMLElement, edit: EditMode) {
    // Toolbox.
    this.container = body.querySelector('.toolbox') as HTMLElement;
    this.edit = edit;
    this.markSelected();
    let container = this.container;
    for (let input of container.querySelectorAll('input[name="tool"]')) {
      input.addEventListener('click', () => {
        for (let other of this.getToolButtons()) {
          other.classList.remove('selected');
        }
        this.markSelected();
      });
    }
    for (let input of container.querySelectorAll('input[type="checkbox"]')) {
      input.addEventListener('change', ({target}) => {
        let input = target as HTMLInputElement;
        let label = input.closest('label') as HTMLElement;
        if (input.checked) {
          label.classList.add('selected');
        } else {
          label.classList.remove('selected');
        }
      });
    }
    // TODO Other panels.
  }

  container: HTMLElement;

  edit: EditMode;

  getButtons(): Array<HTMLElement> {
    return [...this.container.querySelectorAll('label')];
  }

  getName(button: HTMLElement) {
    return [...button.classList].filter(name => name != 'selected')[0];
  }

  getToolButtons(): Array<HTMLElement> {
    return [...this.container.querySelectorAll('input[name="tool"]')].map(
      input => input.closest('label') as HTMLElement);
  }

  markSelected() {
    let selected = this.container.querySelector('input[name="tool"]:checked')!;
    let label = selected.closest('label') as HTMLElement;
    label.classList.add('selected');
    // Get the class name that's not selected.
    // TODO Instead put name on the input?
    let name = this.getName(label);
    this.edit.setToolFromName(name);
  }

}
