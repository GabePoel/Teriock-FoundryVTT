import { mix } from "../../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base {@link TeriockItem} sheet.
 * @extends {ItemSheetV2}
 * @mixes CommonSheet
 * @mixes ChildSheet
 * @property {AnyItem} document
 * @property {AnyItem} item
 */
export default class BaseItemSheet extends mix(
  ItemSheetV2,
  HandlebarsApplicationMixin,
  mixins.CommonSheetMixin,
  mixins.ChildSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = { classes: ["unpadded"] };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      item: this.item,
    });
  }
}
