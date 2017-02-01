import {EditMode, Grid, Level, PartType} from './';
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
    let fontIcon = menuButton.querySelector('i');
    if (fontIcon) {
      // Copy over the full class.
      parent.querySelector(':scope > i')!.className = fontIcon.className;
    } else {
      // Game element.
      // Theme could be missing during startup.
      if (this.edit.game.theme) {
        this.edit.game.theme.updateTool(parent);
      }
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

  activate() {}

  abstract begin(tilePoint: Vector2): void;

  deactivate() {}

  abstract drag(tilePoint: Vector2): void;

  edit: EditMode;

  hover(tilePoint: Vector2) {}

  resize() {}

}

export class CopyTool extends Tool {

  constructor(edit: EditMode) {
    super(edit);
    this.selector = edit.game.body.querySelector('.selector') as HTMLElement;
  }

  activate() {
    this.borderPixels = Number.parseInt(
      getComputedStyle(this.selector).getPropertyValue('border-left-width')
    );
  }

  begin(tilePoint: Vector2) {
    let {point, tileBottomRight, tileTopLeft} = this;
    tileTopLeft.copy(tilePoint);
    tileBottomRight.copy(tilePoint);
    this.place(this.tileBegin.copy(tilePoint));
    this.scaled(point.set(1, 1));
    this.selector.style.width = `${point.x}px`;
    this.selector.style.height = `${point.y}px`;
    this.selector.style.display = 'block';
    this.updateData();
  }

  borderPixels = 0;

  deactivate() {
    this.selector.style.display = 'none';
  }

  drag(tilePoint: Vector2) {
    let anyChange = false;
    let {point, tileBegin, tileBottomRight, tileTopLeft} = this;
    point.x = Math.min(tileBegin.x, tilePoint.x);
    point.y = Math.max(tileBegin.y, tilePoint.y);
    if (!point.equals(tileTopLeft)) {
      tileTopLeft.copy(point);
      anyChange = true;
    }
    point.x = Math.max(tileBegin.x, tilePoint.x);
    point.y = Math.min(tileBegin.y, tilePoint.y);
    if (!point.equals(tileBottomRight)) {
      tileBottomRight.copy(point);
      anyChange = true;
    }
    if (anyChange) {
      this.resize();
      this.updateData();
    }
  }

  place(tilePoint: Vector2) {
    let point = this.scaledOffset(tilePoint);
    this.selector.style.left = `${point.x - this.borderPixels}px`;
    this.selector.style.top = `${point.y - this.borderPixels}px`;
  }

  point = new Vector2();

  resize() {
    let {point, tileBottomRight, tileTopLeft} = this;
    this.place(tileTopLeft);
    point.copy(tileBottomRight).sub(tileTopLeft);
    point.x += 1;
    point.y = -point.y + 1;
    this.scaled(point);
    this.selector.style.width = `${point.x}px`;
    this.selector.style.height = `${point.y}px`;
  }

  scaled(tilePoint: Vector2) {
    let {point} = this;
    let canvas = this.edit.game.renderer.domElement;
    point.copy(tilePoint).divide(Level.tileCount);
    point.x *= canvas.clientWidth;
    point.y *= canvas.clientHeight;
    return point;
  }

  private scaledOffset(tilePoint: Vector2) {
    let {point} = this;
    point.copy(tilePoint);
    point.y = Level.tileCount.y - point.y - 1;
    let canvas = this.edit.game.renderer.domElement;
    this.scaled(point);
    point.x += canvas.offsetLeft;
    point.y += canvas.offsetTop;
    return point;
  }

  selector: HTMLElement;

  tileBegin = new Vector2();

  tileBottomRight = new Vector2();

  tileTopLeft = new Vector2();

  tiles: Grid<PartType> | undefined = undefined;

  updateData() {
    let {edit, point, tileBottomRight, tileTopLeft} = this;
    let {tiles: levelTiles} = edit.game.level;
    let min = new Vector2(tileTopLeft.x, tileBottomRight.y);
    let size =
      new Vector2(tileBottomRight.x - min.x + 1, tileTopLeft.y - min.y + 1);
    let tiles = this.tiles = new Grid<PartType>(size);
    for (let x = 0; x < size.x; ++x) {
      for (let y = 0; y < size.y; ++y) {
        point.set(x, y).add(min);
        let tile = levelTiles.get(point)!;
        point.sub(min);
        tiles.set(point, tile);
      }
    }
    // console.log(tiles);
  }

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

export class PasteTool extends Tool {

  constructor(edit: EditMode) {
    super(edit);
  }

  activate() {
    // TODO Canvas shot or lots of translucent parts?
  }

  begin(tilePoint: Vector2) {
    this.drag(tilePoint);
  }

  drag(tilePoint: Vector2) {
    // TODO Apply.
  }

  hover(tilePoint: Vector2) {
    console.log('show paste at', tilePoint);
  }

}
