import {EditMode, Level} from './';
import {
  // TODO Clean out unused.
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial,
  Vector2, Vector3, WebGLRenderer,
} from 'three';

export interface Mode {

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
    this.scene = new Scene();
    // Ambient light.
    let ambient = new AmbientLight(0xFFFFFF, 1);
    this.scene.add(ambient);
    // // Render.
    // this.render();
    // requestAnimationFrame(() => this.render());
  }

  camera: OrthographicCamera;

  mode: Mode = new EditMode(this);

  redraw?: () => void;

  render() {
    // Prep next frame first for best fps.
    requestAnimationFrame(() => this.render());
    // Render scene.
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
      if (this.scene) {
        this.render();
      }
    }, 0);
  }

  scene: Scene;

}
