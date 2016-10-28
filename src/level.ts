import {Grid, Part, Stage} from './';
import {None} from './parts';
import {Vector2} from 'three';

export class Level {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor() {
    this.tiles = new Grid<new () => Part>(Level.tileCount);
    this.tiles.items.fill(None);
  }

  tiles: Grid<new () => Part>;

  // For use from the editor.
  updateScene(stage: Stage) {
    let scene = stage.scene;
    let theme = stage.theme;
    for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
      for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
        let tile = this.tiles.items[k];
        let part = scene.parts[k];
        // If it's the same type as what we already had, presume it's already in
        // the right place.
        if (!(part instanceof tile)) {
          // Needs to be a new part.
          let part = new tile();
          theme.buildArt(part);
          part.point.set(j, i).multiply(Level.tileSize);
          scene.parts[k] = part;
        }
      }
    }
  }

}
