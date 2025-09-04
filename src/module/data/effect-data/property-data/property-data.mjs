import { mergeFreeze } from "../../../helpers/utils.mjs";
import { HierarchyDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import {
  FormulaField,
  ListField,
  TextField,
} from "../../shared/fields/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { changeField } from "../shared/shared-fields.mjs";
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
 * @mixes WikiDataMixin
 * @mixes HierarchyDataMixin
 */
export default class TeriockPropertyData extends HierarchyDataMixin(
  WikiDataMixin(TeriockBaseEffectData),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    childEffectTypes: ["property"],
    modifies: "Item",
    namespace: "Property",
    type: "property",
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      form: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
      extraDamage: new FormulaField({ deterministic: false }),
      applyIfShattered: new fields.BooleanField({
        initial: false,
        label: "Apply if Shattered",
      }),
      applyIfDampened: new fields.BooleanField({
        initial: false,
        label: "Apply if Dampened",
      }),
      modifiesActor: new fields.BooleanField({
        initial: false,
        label: "Modifies Actor",
      }),
      changes: new ListField(changeField(), {
        label: "Changes",
        hint: "Changes made to the target equipment as part of the property's ongoing effect.",
      }),
      limitation: new TextField({ initial: "", label: "Limitation" }),
      improvement: new TextField({ initial: "", label: "Improvement" }),
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

  /**
   * @inheritDoc
   * @returns {"Actor"|"Item"}
   */
  get modifies() {
    if (this.modifiesActor) return "Actor";
    return super.modifies;
  }

  /** @inheritDoc */
  get nameString() {
    const additions = [];
    if (this.limitation && this.limitation.length > 0) {
      additions.push("Limited");
    }
    if (this.improvement && this.improvement.length > 0) {
      additions.push("Improved");
    }
    let nameAddition = "";
    if (additions.length > 0) {
      nameAddition = ` (${additions.join(", ")})`;
    }
    return this.parent.name + nameAddition;
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

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.parent.changes = foundry.utils.deepClone(this.changes);
    if (
      this.damageType &&
      this.damageType.length > 0 &&
      this.parent.allSups.filter((p) => p.system.damageType?.trim().length > 0)
        .length === 0
    ) {
      this.parent.changes.push({
        key: "system.damageTypes",
        value: this.damageType.toLowerCase(),
        priority: 10,
        mode: 2,
      });
    }
  }
}
