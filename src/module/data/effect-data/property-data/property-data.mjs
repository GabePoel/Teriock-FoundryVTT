import { selectDialog } from "../../../applications/dialogs/select-dialog.mjs";
import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { copyProperty } from "../../../helpers/fetch.mjs";
import { mergeFreeze, pureUuid, safeUuid } from "../../../helpers/utils.mjs";
import {
  HierarchyDataMixin,
  RevelationDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import {
  FormulaField,
  ListField,
  TextField,
} from "../../shared/fields/_module.mjs";
import { changeField } from "../../shared/fields/helpers/field-builders.mjs";
import TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
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
 * @mixes HierarchyDataMixin
 * @mixes RevelationDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockPropertyModel extends RevelationDataMixin(
  HierarchyDataMixin(WikiDataMixin(TeriockBaseEffectModel)),
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
    passive: true,
    indexCategoryKey: "properties",
    indexCompendiumKey: "properties",
    preservedProperties: [
      "system.fluent",
      "system.hierarchy",
      "system.improvement",
      "system.limitation",
      "system.proficient",
    ],
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      applyIfDampened: new fields.BooleanField({
        initial: false,
        label: "Apply if Dampened",
      }),
      applyIfShattered: new fields.BooleanField({
        initial: false,
        label: "Apply if Shattered",
      }),
      damageType: new fields.StringField({ initial: "" }),
      extraDamage: new FormulaField({ deterministic: false }),
      form: new fields.StringField({ initial: "normal" }),
      impacts: new fields.SchemaField({
        changes: new ListField(changeField(), {
          label: "Changes",
          hint: "Changes made to the target equipment as part of the property's ongoing effect.",
        }),
        macros: new fields.TypedObjectField(
          new fields.StringField({
            choices: propertyPseudoHooks,
          }),
        ),
      }),
      improvement: new TextField({
        initial: "",
        label: "Improvement",
      }),
      limitation: new TextField({
        initial: "",
        label: "Limitation",
      }),
      modifiesActor: new fields.BooleanField({
        initial: false,
        label: "Modifies Actor",
      }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get color() {
    return TERIOCK.options.ability.form[this.form].color;
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
    if (!this.revealed) {
      additions.push("Unrevealed");
    }
    let nameAddition = "";
    if (additions.length > 0) {
      nameAddition = ` (${additions.join(", ")})`;
    }
    return this.parent.name + nameAddition;
  }

  /** @inheritDoc */
  get suppressed() {
    return _suppressed(this);
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
      initial: this.impacts.macros[safeUuid(uuid)],
    });
    const updateData = {};
    updateData[`system.impacts.macros.${safeUuid(uuid)}`] = pseudoHook;
    await this.parent.update(updateData);
  }

  /** @inheritDoc */
  async getIndexReference() {
    return await copyProperty(this.parent.name);
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const changes = foundry.utils.deepClone(this.impacts.changes);
    let macroPrefix = "system.hookedMacros.";
    if (this.modifies === "Item") {
      macroPrefix = "item." + macroPrefix;
    }
    for (const [safeUuid, pseudoHook] of Object.entries(this.impacts.macros)) {
      const change = {
        key: `${macroPrefix}${pseudoHook}`,
        value: pureUuid(safeUuid),
        mode: 2,
        priority: 5,
      };
      changes.push(change);
    }
    this.parent.changes = foundry.utils.deepClone(changes);
    if (
      this.damageType &&
      this.damageType.length > 0 &&
      this.parent.allSups.filter((p) => p.system.damageType?.trim().length > 0)
        .length === 0
    ) {
      this.parent.changes.push({
        key: "item.system.damage.types",
        value: this.damageType.toLowerCase(),
        priority: 10,
        mode: 2,
      });
    }
  }

  /**
   * Unlink a macro.
   * @param {Teriock.UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async unlinkMacro(uuid) {
    const updateData = {};
    updateData[`system.impacts.macros.-=${safeUuid(uuid)}`] = null;
    await this.parent.update(updateData);
  }
}
