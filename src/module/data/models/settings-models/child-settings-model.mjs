import { blockGaplessField, blockSizeField } from "../../fields/helpers/builders.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

export default class ChildSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.CommonSettings"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      sheet: new fields.SchemaField({
        blockChildGapless: blockGaplessField({ initial: false }),
        blockChildSize: blockSizeField(),
      }),
    });
  }
}
