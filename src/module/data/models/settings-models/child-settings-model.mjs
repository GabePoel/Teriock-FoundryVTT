import {
  blockGaplessField,
  blockSizeField,
} from "../../fields/helpers/builders.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

export default class ChildSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      sheetBlockChildSize: blockSizeField(),
      sheetBlockChildGapless: blockGaplessField({ initial: false }),
    });
  }
}
