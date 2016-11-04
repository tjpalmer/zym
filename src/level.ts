import {Grid, Part, PartType, Stage} from './';
import {None, Parts} from './parts';
import {Vector2} from 'three';

export class Level {

  static tileCount = new Vector2(40, 20);

  static tileSize = new Vector2(8, 10);

  static pixelCount = Level.tileCount.clone().multiply(Level.tileSize);

  constructor({tiles}: {tiles?: Grid<PartType>} = {}) {
    if (tiles) {
      this.tiles = tiles;
    } else {
      this.tiles = new Grid<PartType>(Level.tileCount);
      this.tiles.items.fill(None);
    }
  }

  copy() {
    return new Level({tiles: this.tiles.copy()});
  }

  equals(other: Level): boolean {
    for (let i = 0; i < this.tiles.items.length; ++i) {
      if (this.tiles.items[i] != other.tiles.items[i]) {
        return false;
      }
    }
    return true;
  }

  tiles: Grid<PartType>;

  toPlain() {
    let point = new Vector2();
    let rows: Array<string> = [];
    for (let i = Level.tileCount.y -1 ; i >= 0; --i) {
      let row: Array<string> = [];
      for (let j = 0; j < Level.tileCount.x; ++j) {
        let type = this.tiles.get(point.set(j, i));
        let char = Parts.partChars.get(type);
        row.push(char || '?');
      }
      rows.push(row.join(''));
    }
    return {tiles: rows.join('\n')};
  }

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
