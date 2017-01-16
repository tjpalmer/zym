import {EditMode, PartType} from './';
import {None} from './parts';
import {Vector2} from 'three';

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
    // TODO Assert only one if fieldName?
    for (let selected of selecteds) {
      let label = selected.closest('label') as HTMLElement;
      label.classList.add('selected');
      // Get the class name that's not selected.
      // TODO Instead put name on the input?
      let name = this.getName(label);
      if (selected.name == 'tool') {
        this.edit.setToolFromName(name);
      } else {
        this.updateTool(label);
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

  updateTool(menuButton: HTMLElement) {
    let name = this.getName(menuButton);
    // Change the parent.
    let parent =
      (menuButton.parentNode as HTMLElement).closest('label') as HTMLElement;
    let parentName = this.getName(parent);
    parent.classList.remove(parentName);
    parent.classList.add(name);
    // Change the parent's appearance.
    // Theme could be missing during startup.
    if (this.edit.game.theme) {
      this.edit.game.theme.updateTool(parent);
    }
    // Select the parent.
    parent.click();
    // Hide the menu.
    let menu = parent.querySelector('.toolMenu') as HTMLElement;
    menu.style.display = 'none';
    // But allow it to come back.
    window.setTimeout(() => menu.style.display = '', 0);
  }

}

export abstract class Tool {

  constructor(edit: EditMode) {
    this.edit = edit;
  }

  abstract begin(tilePoint: Vector2): void;

  abstract drag(tilePoint: Vector2): void;

  edit: EditMode;

}

export class NopTool extends Tool {
  begin() {}
  drag() {}
}

export class PartTool extends Tool {

  constructor(edit: EditMode, type: PartType) {
    super(edit);
    this.type = type;
  }

  begin(tilePoint: Vector2) {
    if (this.type == None) {
      this.erasing = false;
    } else {
      let old = this.edit.game.level.tiles.get(tilePoint);
      this.erasing = old == this.type;
    }
  }

  drag(tilePoint: Vector2) {
    let {game} = this.edit;
    let {level} = game;
    let {type} = this;
    if (this.erasing) {
      if (type == level.tiles.get(tilePoint)) {
        type = None;
      } else {
        // We only erase those matching our current tool, so get out.
        return;
      }
    }
    if (level.tiles.get(tilePoint) == type) {
      // No need to spin wheels when no change.
      return;
    }
    level.tiles.set(tilePoint, type);
    if (type) {
      type.make(game).editPlacedAt(tilePoint);
    }
    level.updateStage(game);
  }

  erasing = false;

  type: PartType;

}
