import { selectDialog } from "../../../applications/dialogs/select-dialog.mjs";
import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { pureUuid, safeUuid } from "../../../helpers/resolve.mjs";
import { mix } from "../../../helpers/utils.mjs";
import { FormulaField, TextField } from "../../fields/_module.mjs";
import { changeField } from "../../fields/helpers/builders.mjs";
import * as mixins from "../../mixins/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import * as parsing from "./parsing/_parsing.mjs";

const { fields } = foundry.data;

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {TeriockBaseEffectModel}
 * @mixes HierarchyData
 * @mixes RevelationData
 * @mixes WikiData
 */
export default class TeriockPropertyModel extends mix(
  TeriockBaseEffectModel,
  mixins.WikiDataMixin,
  mixins.HierarchyDataMixin,
  mixins.RevelationDataMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["property"],
      indexCategoryKey: "properties",
      indexCompendiumKey: "properties",
      modifies: "Item",
      namespace: "Property",
      passive: true,
      preservedProperties: [
        "system.fluent",
        "system.hierarchy",
        "system.improvement",
        "system.limitation",
        "system.proficient",
      ],
      type: "property",
      visibleTypes: ["property"],
    });
  }

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
        changes: new fields.ArrayField(changeField(), {
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
    // Form migration
    if (foundry.utils.getProperty(data, "propertyType")) {
      foundry.utils.setProperty(
        data,
        "form",
        foundry.utils.getProperty(data, "propertyType"),
      );
    }

    // Impact migration
    if (foundry.utils.hasProperty(data, "applies")) {
      data.impacts = foundry.utils.getProperty(data, "applies");
      foundry.utils.deleteProperty(data, "applies");
    }
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get color() {
    return TERIOCK.options.ability.form[this.form].color;
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", "system.improvement", "system.limitation"];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.options.ability.form[this.form].name;
    return parts;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = false;
    if (this.parent.elder?.type !== "equipment") {
      suppressed = !!(
        this.parent.elder?.documentName === "Item" && !this.parent.elder?.active
      );
    }
    if (!suppressed && this.parent.parent.type === "equipment") {
      if (
        !suppressed &&
        !this.parent.parent.system.equipped &&
        this.modifies === "Actor"
      ) {
        suppressed = true;
      }
      if (
        !suppressed &&
        this.parent.parent.system.dampened &&
        this.form !== "intrinsic" &&
        !this.applyIfDampened
      ) {
        suppressed = true;
      }
    }
    if (
      !suppressed &&
      this.parent.parent.system.shattered &&
      !this.applyIfShattered
    ) {
      suppressed = true;
    }
    if (!suppressed && this.actor && this.parent.sup) {
      const sups = this.parent.allSups;
      if (sups.some((sup) => !sup.modifiesActor)) {
        suppressed = true;
      }
    }
    return suppressed;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: "fa-" + TERIOCK.options.ability.form[this.form].icon,
        label: "Property Type",
        wrappers: [TERIOCK.options.ability.form[this.form].name],
      },
    ];
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

  /**
   * Change a macro's run hook.
   * @param {UUID<TeriockMacro>} uuid
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
      this.parent.allSups.filter(
        /** @param {TeriockProperty} p */ (p) =>
          p.system.damageType?.trim().length > 0,
      ).length === 0
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
   * @param {UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async unlinkMacro(uuid) {
    const updateData = {};
    updateData[`system.impacts.macros.-=${safeUuid(uuid)}`] = null;
    await this.parent.update(updateData);
  }
}
