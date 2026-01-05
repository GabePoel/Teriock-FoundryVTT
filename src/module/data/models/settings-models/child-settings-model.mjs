import {
  blockGaplessField,
  blockSizeField,
} from "../../fields/helpers/builders.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

export default class ChildSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      sheetBlockChildSize: blockSizeField(),
      sheetBlockChildGapless: blockGaplessField({
        initial: false,
      }),
    });
    return schema;
  }
}
