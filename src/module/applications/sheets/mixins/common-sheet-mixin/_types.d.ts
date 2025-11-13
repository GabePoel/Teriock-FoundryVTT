import { DragDropCommonSheetPartInterface } from "./parts/_types";

export interface CommonSheetMixinInterface
  extends DragDropCommonSheetPartInterface {
  get document(): TeriockCommon;
}
