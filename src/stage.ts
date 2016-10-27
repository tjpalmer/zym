import {EditMode, Level, Scene} from './';
import {
  // TODO Clean out unused.
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  OrthographicCamera, PlaneBufferGeometry, Scene as Scene3, ShaderMaterial,
  Vector2, Vector3, WebGLRenderer,
} from 'three';

export interface PointEvent {
  point: Vector2;
}

export interface Mode {

  mouseDown(event: PointEvent): void;

  mouseMove(event: PointEvent): void;

  mouseUp(event: PointEvent): void;

}

export class Stage {

  constructor() {
    // TODO Extract some setup to graphics modes?
    // Renderer.
    let canvas = <HTMLCanvasElement>document.body.querySelector('.stage');
    let renderer = this.renderer =
      new WebGLRenderer({antialias: false, canvas});
    // Camera.
    this.camera = new OrthographicCamera(
      0, Level.pixelCount.x, Level.pixelCount.y, 0, -1e5, 1e5,
    );
    this.camera.position.z = 1;
    // Resize handling after renderer and camera.
    window.addEventListener('resize', () => this.resize());
    this.resize();
    canvas.style.display = 'block';
    // Scene.
    this.scene3 = new Scene3();
    // Ambient light.
    let ambient = new AmbientLight(0xFFFFFF, 1);
    this.scene3.add(ambient);
    // Input handlers.
    canvas.addEventListener('mousedown', event => this.mouseDown(event));
    window.addEventListener('mousemove', event => this.mouseMove(event));
    window.addEventListener('mouseup', event => this.mouseUp(event));
    // // Render.
    // this.render();
    // requestAnimationFrame(() => this.render());
  }

  camera: OrthographicCamera;

  level = new Level();

  mode: Mode = new EditMode(this);

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

  redraw?: () => void;

  render() {
    // Prep next frame first for best fps.
    requestAnimationFrame(() => this.render());
    // Render scene.
    if (this.redraw) {
      this.redraw();
    }
    this.renderer.render(this.scene3, this.camera);
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
      let view = document.body.querySelector('.view');
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
      // TODO OrthographicCamera version of this.
      // this.camera.aspect = size.x / size.y;
      // this.camera.updateProjectionMatrix();
      this.renderer.setSize(canvasSize.x, canvasSize.y);
      if (this.scene3) {
        this.render();
      }
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

  scene = new Scene();

  scene3: Scene3;

}
