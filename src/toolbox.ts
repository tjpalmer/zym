import {EditMode, Grid, Level, Part, PartType, copyPoint} from './index';
import {None} from './parts/index';
import {Messages} from './ui/index';
import {Vector2, WebGLRenderTarget} from 'three';

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
    if (name in Part.options) {
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

  end() {}

  hover(tilePoint: Vector2) {}

  resize() {}

}

export abstract class SelectionTool extends Tool {

  constructor(edit: EditMode, name: string) {
    super(edit);
    this.selector = edit.game.body.querySelector(`.${name}`) as HTMLElement;
  }

  activate() {
    this.borderPixels = Number.parseInt(
      getComputedStyle(this.selector).getPropertyValue('border-left-width')
    );
  }

  begin(tilePoint: Vector2) {
    // First, reset our selection.
    this.needsUpdate = true;
    let {point, tileBottomRight, tileTopLeft} = this;
    tileTopLeft.copy(tilePoint);
    tileBottomRight.copy(tilePoint);
    this.place(this.tileBegin.copy(tilePoint));
    this.scaled(point.set(1, 1));
    this.selector.style.width = `${point.x}px`;
    this.selector.style.height = `${point.y}px`;
    this.selector.style.display = 'block';
  }

  borderPixels = 0;

  deactivate() {
    if (this.needsUpdate) {
      this.updateData();
      this.needsUpdate = false;
    }
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
    }
  }

  needsUpdate = false;

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

  scaledOffset(tilePoint: Vector2) {
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

  abstract updateData(): void;

}

export class CopyTool extends SelectionTool {

  constructor(edit: EditMode) {
    super(edit, 'selector');
  }

  deactivate() {
    this.selector.style.display = 'none';
    super.deactivate();
  }

  end() {
    let paste =
      this.edit.toolbox.container.querySelector('.paste') as HTMLElement;
    paste.click();
    this.selector.style.display = 'block';
  }

  tiles: Grid<PartType> | undefined = undefined;

  updateData() {
    // Copy data.
    let {edit, point, tileBottomRight, tileTopLeft} = this;
    let {tiles: levelTiles} = edit.game.level;
    let min = new Vector2(tileTopLeft.x, tileBottomRight.y);
    let max = new Vector2(tileBottomRight.x, tileTopLeft.y).addScalar(1);
    let size = new Vector2(max.x - min.x, max.y - min.y);
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
    // Copy visuals.
    // The other option is phantom parts.
    // Or a whole separate scene.
    // All have pain.
    max.multiply(Level.tileSize);
    min.multiply(Level.tileSize);
    size.multiply(Level.tileSize);
    let image = document.createElement('canvas');
    let target = new WebGLRenderTarget(size.x, size.y);
    try {
      let {camera, renderer, scene} = edit.game;
      camera = camera.clone();
      camera.bottom = min.y;
      camera.left = min.x;
      camera.right = max.x;
      camera.top = max.y;
      camera.updateProjectionMatrix();
      // TODO Extract this render-to-canvas logic?
      renderer.render(scene, camera, target);
      let data = new Uint8Array(4 * size.x * size.y);
      renderer.readRenderTargetPixels(target, 0, 0, size.x, size.y, data);
      image.width = size.x;
      image.height = size.y;
      let context = image.getContext('2d')!;
      let imageData = context.createImageData(size.x, size.y);
      imageData.data.set(data as any);
      context.putImageData(imageData, 0, 0);
    } finally {
      target.dispose();
    }
    image.style.transform = 'scaleY(-1)';
    let clipboard = edit.game.body.querySelector('.clipboard')!;
    clipboard.innerHTML = '';
    clipboard.appendChild(image);
  }

}

export class CropTool extends SelectionTool {

  constructor(edit: EditMode) {
    super(edit, 'cropper');
  }

  begin(tilePoint: Vector2) {
    super.begin(tilePoint);
    this.updateData();
  }

  deactivate() {
    super.deactivate();
    if (!this.edit.game.level.bounds) {
      this.selector.style.display = 'none';
    }
  }

  drag(tilePoint: Vector2) {
    super.drag(tilePoint);
    this.updateData();
  }

  updateData() {
    let {edit, point, tileBottomRight, tileTopLeft} = this;
    let {level} = edit.game;
    let {tileCount} = Level;
    let min = new Vector2(tileTopLeft.x, tileBottomRight.y);
    let max = new Vector2(tileBottomRight.x, tileTopLeft.y).addScalar(1);
    if (min.x > 0 || min.y > 0 || max.x < tileCount.x || max.y < tileCount.y) {
      level.bounds = {max: copyPoint(max), min: copyPoint(min)};
    } else {
      level.bounds = undefined;
    }
    this.needsUpdate = false;
  }

  updateView() {
    let {bounds} = this.edit.game.level;
    if (bounds) {
      this.tileBottomRight.set(bounds.max.x - 1, bounds.min.y);
      this.tileTopLeft.set(bounds.min.x, bounds.max.y - 1);
      this.resize();
      this.selector.style.display = 'block';
    } else {
      this.selector.style.display = 'none';
    }
  }

}

// export class MessageTool extends SelectionTool {

//   constructor(edit: EditMode) {
//     super(edit, 'selector');
//   }

//   activate() {
//     this.edit.game.showDialog(new Messages(this.edit));
//     super.activate();
//   }

//   deactivate() {
//     this.selector.style.display = 'none';
//     super.deactivate();
//   }

//   updateData(): void {
//     // throw new Error("Method not implemented.");
//   }

// }

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
    // Figure out mode.
    if (this.type == None) {
      this.erasing = false;
    } else {
      let old = this.edit.game.level.tiles.get(tilePoint);
      this.erasing = old == this.type;
    }
    // Now apply.
    this.drag(tilePoint);
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
    this.edit.draw(tilePoint, type);
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
    let {body} = this.edit.game;
    this.clipboard = body.querySelector('.clipboard') as HTMLElement;
    this.resize();
  }

  begin(tilePoint: Vector2) {
    this.drag(tilePoint);
    this.edit.copyTool.selector.style.display = 'none';
  }

  clipboard?: HTMLElement = undefined;

  deactivate() {
    this.clipboard!.style.display = 'none';
    // TODO How to avoid hiding if the new tool is copy?
    this.edit.copyTool.selector.style.display = 'none';
  }

  drag(tilePoint: Vector2) {
    let {edit, point, tileMin} = this;
    let {tiles} = edit.copyTool;
    if (!tiles) {
      return;
    }
    let {game} = edit;
    let {level} = edit.game;
    let {tiles: levelTiles} = level;
    // Update where we are.
    this.place(tilePoint);
    // Draw.
    let {size} = tiles;
    for (let x = 0; x < size.x; ++x) {
      for (let y = 0; y < size.y; ++y) {
        point.set(x, y);
        let tile = tiles.get(point)!;
        this.edit.draw(point.add(tileMin), tile);
      }
    }
    level.updateStage(edit.game);
  }

  hover(tilePoint: Vector2) {
    if (!this.edit.copyTool.tiles) {
      return;
    }
    this.place(tilePoint);
    this.clipboard!.style.display = 'block';
  }

  place(tilePoint: Vector2) {
    let {clipboard, edit, point, tileMin} = this;
    let {copyTool} = edit;
    if (!copyTool.tiles) {
      return;
    }
    // TODO Treat size as immutable!
    let {size} = copyTool.tiles;
    point.copy(copyTool.tiles.size).multiplyScalar(0.5);
    tileMin.copy(tilePoint).sub(point);
    // Keep things in bounds.
    tileMin.x = Math.max(0, tileMin.x);
    tileMin.y = Math.max(0, tileMin.y);
    point.copy(tileMin).add(size);
    if (point.x >= Level.tileCount.x) {
      tileMin.x = Level.tileCount.x - size.x;
    }
    if (point.y >= Level.tileCount.y) {
      tileMin.y = Level.tileCount.y - size.y;
    }
    // Now make sure to align with grid.
    tileMin.x = Math.ceil(tileMin.x);
    tileMin.y = Math.ceil(tileMin.y);
    // Now place it.
    point.copy(tileMin);
    point.y += size.y - 1;
    // Copy because we otherwise get copyTool's internal storage point.
    point.copy(copyTool.scaledOffset(point));
    clipboard!.style.left = `${point.x}px`;
    clipboard!.style.top = `${point.y}px`;
  }

  point = new Vector2();

  resize() {
    this.edit.copyTool.resize();
    let {domElement} = this.edit.game.renderer;
    let image = this.clipboard!.querySelector('canvas')!;
    let size = new Vector2(domElement.width, domElement.height);
    size.divide(Level.pixelCount);
    size.x *= image.width;
    size.y *= image.height;
    image.style.width = `${size.x}px`;
    image.style.height = `${size.y}px`;
  }

  tileMin = new Vector2();

}
