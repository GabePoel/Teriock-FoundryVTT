import { mergeFreeze } from "../../../helpers/utils.mjs";
import {
  AttunableDataMixin,
  StatGiverDataMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

const { fields } = foundry.data;

/**
 * Mount-specific item data model.
 * @extends {TeriockBaseItemModel}
 * @mixes AttunableDataMixin
 * @mixes StatGiverDataMixin
 */
export default class TeriockMountModel extends StatGiverDataMixin(
  AttunableDataMixin(TeriockBaseItemModel),
) {
  /** @inheritDoc */
  static metadata = mergeFreeze(super.metadata, {
    type: "mount",
    childEffectTypes: ["ability", "fluency", "resource"],
  });

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      mountType: new fields.StringField({
        initial: "Mount Type",
        required: false,
      }),
      mounted: new fields.BooleanField({
        initial: false,
        required: false,
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Mount this mount.
   * @returns {Promise<void>}
   */
  async mount() {
    const data = { doc: this.parent };
    await this.parent.hookCall("mountMount", data);
    if (!data.cancel) {
      await this.parent.update({ "system.mounted": true });
    }
  }

  /**
   * Unmount this mount.
   * @returns {Promise<void>}
   */
  async unmount() {
    const data = { doc: this.parent };
    await this.parent.hookCall("mountUnmount", data);
    if (!data.cancel) {
      await this.parent.update({ "system.mounted": false });
    }
  }
}
