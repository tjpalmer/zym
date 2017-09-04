import {Enemy} from './index';
import {Part} from '../index';

export class Spawn extends Part {

  static char = 'M';

  static respawnMaybe(part: Part) {
    if (!(part instanceof Enemy)) {
      return;
    }
    // Find the spawn point, if any, and spawn.
    let choice: Spawn | undefined = undefined;
    let min = Infinity;
    for (let spawn of part.game.stage.spawns) {
      let distance = part.point.distanceTo(spawn.point);
      // Could possibly be equal or close but that's rare, and this will do.
      if (distance < min) {
        choice = spawn;
        min = distance;
      }
    }
    // Spawn a new enemy.
    if (choice) {
      choice.queueSpawn(new Enemy(part.game))
    }
  }

  queueSpawn(part: Part) {
    this.spawnItems.push({part, time: this.game.stage.time + 5});
  }

  spawn(part: Part) {
    let {stage} = this.game;
    this.game.theme.buildArt(part);
    part.point.copy(this.point);
    stage.particles.push(part);
    stage.added(part);
  }

  spawnItems = new Array<SpawnItem>();

  update() {
    if (!this.spawnItems.length) {
      return;
    }
    let first = this.spawnItems[0];
    if (this.game.stage.time >= first.time) {
      this.spawnItems.shift();
      this.spawn(first.part);
    }
  }

}

interface SpawnItem {
  part: Part;
  time: number;
}
