import {EditorList} from "./";
import {Tower} from "../";

export class Towers extends EditorList<Tower> {

  buildTitleBar(): void {
    throw new Error('Method not implemented.');
  }

  outsideSelectedValue: Tower;

  showValue(value: Tower): void {
    throw new Error('Method not implemented.');
  }

  values: any[];

}
