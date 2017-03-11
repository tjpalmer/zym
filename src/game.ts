import {
  Control, EditMode, Level, PlayMode, Stage, Theme, Tower, Zone
} from './';
import {
  // TODO Clean out unused.
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial, Vector2,
  Vector3, WebGLRenderer,
} from 'three';

export interface Dialog {
  content: HTMLElement;  
}

export interface PointEvent {
  point: Vector2;
}

export class Mode {

  constructor(game: Game) {
    this.game = game;
  }

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
    this.mode = this.edit;
    // Input handlers.
    this.control = new Control(this)
    canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
    window.addEventListener('mouseup', event => this.mouseUp(event));
  }

  body: HTMLElement;

  camera: OrthographicCamera;

  control: Control;

  edit: EditMode;

  hideDialog() {
    (this.body.querySelector('.pane') as HTMLElement).style.display = 'none';
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
  }

  showingDialog() {
    let pane = this.body.querySelector('.pane') as HTMLElement;
    let style = window.getComputedStyle(pane);
    return style.display != 'none';
  }

  stage = new Stage(this);

  scene: Scene;

  theme: Theme;

  tower: Tower;

  zone: Zone;

}

// TODO Move to Tower.
function loadLevel(tower: Tower) {
  let level: Level | undefined = undefined;
  // Check for direct content, for backward compatibility with early testing.
  let levelId = window.localStorage['zym.levelId'];
  if (levelId) {
    // Should already be loaded in the tower.
    level = tower.items.find(level => level.id == levelId);
  }
  if (!level) {
    // Safety net, in case it's unlisted in the tower.
    // TODO Helper function on objects id key.
    let levelString = window.localStorage[`zym.objects.${levelId}`];
    if (levelString) {
      level = new Level().load(levelString);
      tower.items.push(level);
      // TODO Save the tower?
    }
  }
  if (!level) {
    // Another safety net, or just for kick off.
    level = tower.items[0];
    window.localStorage['zym.levelId'] = level.id;
  }
  return level;
}

// Move to Zone?
function loadTower(zone: Zone) {
  let tower = new Tower();
  let towerId =
    window.localStorage['zym.towerId'] || window.localStorage['zym.worldId'];
  if (towerId) {
    let towerString = window.localStorage[`zym.objects.${towerId}`];
    if (towerString) {
      let encodedTower = JSON.parse(towerString);
      if (encodedTower.levels) {
        // Update to generic form.
        // TODO(tjp): Remove this once all converted?
        encodedTower.items = encodedTower.levels;
        delete encodedTower.levels;
      }
      tower.decode(encodedTower);
    } else {
      // Save the tower for next time.
      tower.save();
    }
  } else {
    // Save the tower for next time.
    tower.save();
  }
  if (zone.items.length == 1 && !zone.items[0].id) {
    zone.items[0].fromTower(tower);
    zone.save();
  }
  window.localStorage['zym.towerId'] = tower.id;
  return tower;
}

function loadZone() {
  let zone = new Zone();
  let zoneId = window.localStorage['zym.zoneId'];
  if (zoneId) {
    let zoneString = window.localStorage[`zym.objects.${zoneId}`];
    if (zoneString) {
      let encodedZone = JSON.parse(zoneString);
      // TODO(tjp): We don't really want to decode all towers at once.
      // TODO(tjp): Some option for lazy or such????
      zone.decode(encodedZone);
    } else {
      zone.save();
    }
  } else {
    zone.save();
  }
  console.log(zone);
  window.localStorage['zym.zoneId'] = zone.id;
  return zone;
}
