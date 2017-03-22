import {
  Control, EditMode, ItemMeta, Level, LevelRaw, ListRaw, PlayMode, Raw, Stage,
  Theme, Tower, Zone,
} from './';
import {
  // TODO Clean out unused.
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial, Vector2,
  Vector3, WebGLRenderer,
} from 'three';

export class Dialog {

  constructor(game: Game) {
    this.game = game;
  }

  content: HTMLElement;  

  game: Game;

  onKey(event: KeyboardEvent, down: boolean) {}

}

export interface PointEvent {
  point: Vector2;
}

export class Mode {

  constructor(game: Game) {
    this.game = game;
  }

  bodyClass: string;

  enter() {}
  exit() {}

  getButton(command: string): HTMLElement {
    return this.game.body.querySelector(`.panel .${command}`) as HTMLElement;
  }

  game: Game;

  mouseDown(event: PointEvent) {}
  mouseMove(event: PointEvent) {}
  mouseUp(event: PointEvent) {}

  onClick(command: string, handler: () => void) {
    this.getButton(command).addEventListener('click', handler);
  }

  resize() {}

  tick() {}

  toggleClasses(options: {
    element: HTMLElement, falseClass: string, trueClass: string, value: boolean
  }) {
    let {classList} = options.element;
    if (options.value) {
      classList.add(options.trueClass);
      classList.remove(options.falseClass);
    } else {
      classList.add(options.falseClass);
      classList.remove(options.trueClass);
    }
  }

}

export class Game {

  constructor(body: HTMLElement) {
    this.body = body;
    // UI.
    let dialogBox = body.querySelector('.dialogBox')!;
    dialogBox.addEventListener('click', ({target}) => {
      if (target == dialogBox) {
        this.hideDialog()
      }
    });
    // Load the current level.
    // TODO Define what "current level" means.
    // TODO An encoding more human-friendly than JSON.
    this.zone = loadZone();
    this.tower = loadTower(this.zone);
    this.level = loadLevel(this.tower);
    // TODO Extract some setup to graphics modes?
    // Renderer.
    let canvas = body.querySelector('.stage') as HTMLCanvasElement;
    let renderer = this.renderer =
      new WebGLRenderer({antialias: false, canvas});
    // Camera.
    // Retain this view across themes.
    this.camera = new OrthographicCamera(
      0, Level.pixelCount.x, Level.pixelCount.y, 0, -1e5, 1e5,
    );
    this.camera.position.z = 1;
    // Resize handling after renderer and camera.
    window.addEventListener('resize', () => this.resize());
    this.resize();
    canvas.style.display = 'block';
    // Scene.
    this.scene = new Scene();
    // Modes. After we have a level for them to reference.
    this.edit = new EditMode(this);
    this.play = new PlayMode(this);
    setTimeout(() => this.setMode(this.play), 0);
    // Input handlers.
    this.control = new Control(this)
    canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
    window.addEventListener('mouseup', event => this.mouseUp(event));
  }

  body: HTMLElement;

  camera: OrthographicCamera;

  control: Control;

  dialog?: Dialog;

  edit: EditMode;

  hideDialog() {
    (this.body.querySelector('.pane') as HTMLElement).style.display = 'none';
    this.dialog = undefined;
  }

  level: Level;

  mode: Mode;

  mouseDown(event: MouseEvent) {
    let point = new Vector2(event.offsetX, event.offsetY);
    this.mode.mouseDown({
      point: this.scalePoint(point),
    });
    event.preventDefault();
  }

  mouseMove(event: MouseEvent) {
    let bounding = this.renderer.domElement.getBoundingClientRect();
    // TODO I'm not sure the scroll math is right, but I don't scroll anyway.
    let point = new Vector2(
      event.pageX - (bounding.left + window.scrollX),
      event.pageY - (bounding.top + window.scrollY),
    );
    this.mode.mouseMove({
      point: this.scalePoint(point),
    });
  }

  mouseUp(event: MouseEvent) {
    this.mode.mouseUp({
      point: new Vector2(),
    });
  }

  play: PlayMode;

  redraw?: () => void;

  render() {
    // Prep next frame first for best fps.
    requestAnimationFrame(() => this.render());
    // Handle input.
    this.control.update();
    // Render stage.
    this.mode.tick();
    if (this.redraw) {
      this.redraw();
    }
    this.renderer.render(this.scene, this.camera);
  }

  renderer: WebGLRenderer;

  resize() {
    // This is a hack to let the layout adjust without concern for the canvas
    // size.
    // TODO Set a class that lets us overflow instead of shrinking?
    // TODO The disappearing here can be jarring on continuous resize.
    this.renderer.setSize(1, 1);
    window.setTimeout(() => {
      // Now take the available space.
      let view = document.body.querySelector('.view')!;
      let viewSize = new Vector2(view.clientWidth, view.clientHeight);
      let viewRatio = viewSize.x / viewSize.y;
      let pixelRatio = Level.pixelCount.x / Level.pixelCount.y;
      let canvasSize = new Vector2();
      let {classList} = this.renderer.domElement;
      if (pixelRatio < viewRatio) {
        canvasSize.x = Math.round(pixelRatio * viewSize.y);
        canvasSize.y = viewSize.y;
        classList.add('vertical');
        classList.remove('horizontal');
      } else {
        canvasSize.x = viewSize.x;
        canvasSize.y = Math.round(viewSize.x / pixelRatio);
        classList.add('horizontal');
        classList.remove('vertical');
      }
      let offset = viewSize.clone().sub(canvasSize).divideScalar(2);
      this.renderer.domElement.style.left = `${offset.x}px`;
      this.renderer.setSize(canvasSize.x, canvasSize.y);
      this.mode.resize();
    }, 0);
  }

  setMode(mode: Mode) {
    // Exit the current mode.
    let {classList} = this.body;
    if (this.mode) {
      classList.remove(this.mode.bodyClass);
      this.mode.exit();
    }
    // Set the new value.
    this.mode = mode;
    // Enter the new mode.
    // Update the stage, since that's often needed.
    // Do this *after* the mode gets set.
    this.level.updateStage(this, true);
    classList.add(mode.bodyClass);
    this.mode.enter();
  }

  scalePoint(point: Vector2): Vector2 {
    let canvas = this.renderer.domElement;
    point.divide(new Vector2(canvas.clientWidth, canvas.clientHeight));
    // Put +y up, like GL.
    point.y = 1 - point.y;
    point.multiply(Level.pixelCount);
    return point;
  }

  showDialog(dialog: Dialog) {
    let pane = this.body.querySelector('.pane') as HTMLElement;
    let dialogBox = pane.querySelector('.dialogBox') as HTMLElement;
    while (dialogBox.lastChild) {
      dialogBox.removeChild(dialogBox.lastChild);
    }
    dialogBox.appendChild(dialog.content);
    pane.style.display = 'block';
    this.dialog = dialog;
  }

  showLevel(level: LevelRaw) {
    // TODO Something here is messing with different level objects vs edit state.
    this.level = new Level().decode(level);
    let editState = this.edit.editState;
    if (!editState.history.length) {
      // Make sure we have at least one history item.
      editState.pushHistory(true);
    }
    // This trackChange is just to enable/disable undo/redo.
    editState.trackChange(true);
    this.level.updateStage(this, true);
  }

  showingDialog() {
    let pane = this.body.querySelector('.pane') as HTMLElement;
    let style = window.getComputedStyle(pane);
    return style.display != 'none';
  }

  stage = new Stage(this);

  scene: Scene;

  theme: Theme;

  tower: ItemMeta;

  zone: ItemMeta;

}

// TODO Simplify.
function loadLevel(towerMeta: ItemMeta) {
  let levelId = window.localStorage['zym.levelId'];
  let level = new Level();
  if (levelId) {
    level = new Level().load(levelId);
  } else {
    level.save();
  }
  let tower = new Tower().load(towerMeta.id);
  if (!tower.items.some(item => item.id == level!.id)) {
    // This level isn't in the current tower. Add it.
    // TODO Make sure we keep tower and level selection in sync!
    tower.items.push(level.encode());
    tower.save();
  }
  return level;
}

// TODO Simplify.
export function loadTower(zoneMeta: ItemMeta) {
  let tower = new Tower();
  let towerId =
    window.localStorage['zym.towerId'] || window.localStorage['zym.worldId'];
  if (towerId) {
    let rawTower = Raw.load<ListRaw<Level>>(towerId);
    if (rawTower) {
      if ((rawTower as any).levels) {
        // Update to generic form.
        // TODO(tjp): Remove this once all converted?
        rawTower.items = (rawTower as any).levels;
        delete (rawTower as any).levels;
        Raw.save(rawTower);
      }
      tower.decode(rawTower);
    } else {
      // Save the tower for next time.
      tower.save();
    }
  } else {
    // Save the tower for next time.
    tower.save();
  }
  let zone = new Zone().load(zoneMeta.id);
  if (!zone.items.some(item => item.id == tower!.id)) {
    // This level isn't in the current tower. Add it.
    // TODO Make sure we keep tower and level selection in sync!
    zone.items.push(tower.encode());
    zone.save();
  }
  // This might save the new id or just overwrite. TODO Be more precise?
  window.localStorage['zym.towerId'] = tower.id;
  delete window.localStorage['zym.worldId'];
  return Raw.encodeMeta(tower);
}

// TODO Simplify.
function loadZone() {
  let zone = new Zone();
  let zoneId = window.localStorage['zym.zoneId'];
  if (zoneId) {
    let rawZone = Raw.load<ListRaw<Tower>>(zoneId);
    if (rawZone) {
      zone.decode(rawZone);
    } else {
      zone.save();
    }
  } else {
    zone.save();
  }
  // This might save the new id or just overwrite. TODO Be more precise?
  window.localStorage['zym.zoneId'] = zone.id;
  return Raw.encodeMeta(zone);
}
