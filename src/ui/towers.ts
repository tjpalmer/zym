import {EditorList} from "./";
import {World} from "../";

export class Towers extends EditorList<World> {

  buildTitleBar(): void {
    throw new Error('Method not implemented.');
  }

  outsideSelectedValue: World;

  showValue(value: World): void {
    throw new Error('Method not implemented.');
  }

  values: any[];

}
