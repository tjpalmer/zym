import {BaseArt, Layer} from './';
import {Gun} from '../parts';
import {Vector2} from 'three';

export class GunArt extends BaseArt<Gun> {

  layer = Layer.front;

  get tile() {
    let {part, workPoint} = this;
    workPoint.x = part.facing < 0 ? 24 : 21;
    return workPoint;
  }

  workPoint = new Vector2(0, 10);

}
