import { mergeFreeze } from "../../../helpers/utils.mjs";
import { WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import * as parsing from "./methods/_parsing.mjs";
import { _suppressed } from "./methods/_suppression.mjs";

const { fields } = foundry.data;

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockPropertyData extends WikiDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Property",
    type: "property",
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({
        initial: "Property",
      }),
      form: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }
}
