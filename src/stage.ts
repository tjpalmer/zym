import {
  // TODO Clean out unused.
  AmbientLight, BufferAttribute, BufferGeometry, DirectionalLight, Geometry,
  Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial,
  OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial,
  Vector2, Vector3, WebGLRenderer,
} from 'three';

export class Stage {

  constructor() {
    // TODO Extract some setup to graphics modes?
    // Renderer.
    let renderer = this.renderer = new WebGLRenderer({antialias: false});
    document.body.querySelector('.view').appendChild(renderer.domElement);
    // Camera.
    // TODO
    // Resize handling after renderer and camera.
    window.addEventListener('resize', () => this.resize());
    this.resize();
    // Scene.
    let scene = this.scene = new Scene();
    // Ambient light.
    let ambient = new AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambient);
    // Render.
    this.render();
    // requestAnimationFrame(() => this.render());
  }

  camera: OrthographicCamera;

  render() {
    // Prep next frame first for best fps.
    // requestAnimationFrame(() => this.render());
    // Render scene.
    // this.renderer.render(this.scene, this.camera);
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
      let size = new Vector2(view.clientWidth, view.clientHeight);
      // this.camera.aspect = size.x / size.y;
      // this.camera.updateProjectionMatrix();
      // this.renderer.setSize(size.x, size.y);
      if (this.scene) {
        this.render();
      }
    }, 0);
  }

  scene: Scene;

}
