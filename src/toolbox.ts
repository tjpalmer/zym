import {EditMode} from './';
import {Vector3} from 'three';

export class Toolbox {

  constructor(body: HTMLElement, edit: EditMode) {
    // Toolbox.
    this.container = body.querySelector('.toolbox') as HTMLElement;
    this.edit = edit;
    this.markSelected();
    let container = this.container;
    for (let input of container.querySelectorAll(this.radioQuery())) {
      input.addEventListener('click', ({target}) => {
        let input = target as HTMLInputElement;
        for (let other of this.getToolButtons(input.name)) {
          other.classList.remove('selected');
        }
        this.markSelected(input.name);
      });
    }
    for (let input of container.querySelectorAll('input[type="checkbox"]')) {
      input.addEventListener('change', ({target}) => {
        let input = target as HTMLInputElement;
        let label = input.closest('label') as HTMLElement;
        if (!label.classList.contains('disabled')) {
          if (input.checked) {
            label.classList.add('selected');
          } else {
            label.classList.remove('selected');
          }
          this.handleChangedCheckbox(input);
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

  getState(name: string) {
    return (
      this.container.querySelector(`.${name} input`) as HTMLInputElement
    ).checked;
  }

  getToolButtons(fieldName?: string): Array<HTMLElement> {
    return [...this.container.querySelectorAll(this.radioQuery(fieldName))].map(
      input => input.closest('label') as HTMLElement
    );
  }

  handleChangedCheckbox(checkbox: HTMLInputElement) {
    let name = this.getName(checkbox.closest('label') as HTMLElement);
    if (name == 'ender') {
      this.edit.updateTool();
    }
  }

  markSelected(fieldName?: string) {
    let query = this.radioQuery(fieldName) + ':checked';
    let selecteds =
      this.container.querySelectorAll(query) as NodeListOf<HTMLInputElement>;
    for (let selected of selecteds) {
      let label = selected.closest('label') as HTMLElement;
      label.classList.add('selected');
      // Get the class name that's not selected.
      // TODO Instead put name on the input?
      let name = this.getName(label);
      if (selected.name == 'tool') {
        this.edit.setToolFromName(name);
      }
    }
  }

  radioQuery(fieldName?: string) {
    let query = 'input[type="radio"]';
    if (fieldName) {
      query += `[name="${fieldName}"]`;
    }
    return query;
  }

}
