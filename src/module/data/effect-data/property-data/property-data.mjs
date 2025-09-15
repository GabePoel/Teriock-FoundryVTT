import { selectDialog } from "../../../applications/dialogs/select-dialog.mjs";
import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { mergeFreeze, pureUuid, safeUuid } from "../../../helpers/utils.mjs";
import { HierarchyDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import { FormulaField, ListField, TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
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
 * @extends {TeriockBaseEffectModel}
 * @mixes WikiDataMixin
 * @mixes HierarchyDataMixin
 */
export default class TeriockPropertyModel extends HierarchyDataMixin(WikiDataMixin(TeriockBaseEffectModel)) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    childEffectTypes: [ "property" ],
    modifies: "Item",
    namespace: "Property",
    type: "property",
    passive: true,
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
      limitation: new TextField({
        initial: "",
        label: "Limitation",
      }),
      improvement: new TextField({
        initial: "",
        label: "Improvement",
      }),
      applies: new fields.SchemaField({
        changes: new ListField(changeField(), {
          label: "Changes",
          hint: "Changes made to the target equipment as part of the property's ongoing effect.",
        }),
        macros: new fields.TypedObjectField(new fields.StringField({
          choices: propertyPseudoHooks,
        })),
      }),
    });
  }

  /**
   * Change a macro's run hook.
   * @param {Teriock.UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async changeMacroRunHook(uuid) {
    const pseudoHook = await selectDialog(propertyPseudoHooks, {
      label: "Event",
      hint: "Please select an event that triggers this macro to run.",
      title: "Select Event",
      initial: this.applies.macros[safeUuid(uuid)],
    });
    const updateData = {};
    updateData[`system.applies.macros.${safeUuid(uuid)}`] = pseudoHook;
    await this.parent.update(updateData);
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
    if (this.modifiesActor) {
      return "Actor";
    }
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
    const changes = foundry.utils.deepClone(this.applies.changes);
    for (const [ safeUuid, pseudoHook ] of Object.entries(this.applies.macros)) {
      const change = {
        key: `system.hookedMacros.${pseudoHook}`,
        value: pureUuid(safeUuid),
        mode: 2,
        priority: 5,
      };
      changes.push(change);
    }
    this.parent.changes = foundry.utils.deepClone(changes);
    if (this.damageType
      && this.damageType.length
      > 0
      && this.parent.allSups.filter((p) => p.system.damageType?.trim().length > 0).length
      === 0) {
      this.parent.changes.push({
        key: "system.damageTypes",
        value: this.damageType.toLowerCase(),
        priority: 10,
        mode: 2,
      });
    }
  }
}
