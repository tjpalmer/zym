import {BaseArt, Layer} from './index';
import {Gun} from '../parts/index';
import {Vector2} from 'three';

export class GunArt extends BaseArt<Gun> {

  layer = Layer.gun;

  get tile() {
    let {part, workPoint} = this;
    workPoint.x = part.facing < 0 ? 24 : 21;
    return workPoint;
  }

  workPoint = new Vector2(0, 10);

}
