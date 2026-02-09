import { selectDialog } from "../../../../applications/dialogs/select-dialog.mjs";
import { propertyPseudoHooks } from "../../../../constants/system/pseudo-hooks.mjs";
import { pureUuid, safeUuid } from "../../../../helpers/resolve.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import { FormulaField, TextField } from "../../../fields/_module.mjs";
import { qualifiedChangeField } from "../../../fields/helpers/builders.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import {
  qualifyChange,
  scaleChange,
} from "../../../shared/migrations/migrate-changes.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {BaseEffectSystem}
 * @implements {Teriock.Models.PropertySystemInterface}
 * @mixes HierarchySystem
 * @mixes RevelationSystem
 * @mixes WikiSystem
 */
export default class PropertySystem extends mix(
  BaseEffectSystem,
  mixins.WikiSystemMixin,
  mixins.HierarchySystemMixin,
  mixins.RevelationSystemMixin,
) {
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.ChangesAutomation,
      automations.CheckAutomation,
      automations.RollAutomation,
    ];
  }

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
        "system.hierarchy",
        "system.improvement",
        "system.limitation",
        "system.competence",
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
        changes: new fields.ArrayField(qualifiedChangeField(), {
          label: "Changes",
          hint: "Changes made to the target equipment as part of the property's ongoing effects.",
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

    // Changes migration
    if (data.impacts?.changes) {
      data.impacts.changes = data.impacts.changes.map((c) =>
        scaleChange(qualifyChange(c)),
      );
    }
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get changes() {
    return [
      ...this.impacts.changes,
      ...Object.entries(this.impacts.macros).map(([safeUuid, pseudoHook]) => {
        return {
          key: `system.hookedMacros.${pseudoHook}`,
          mode: 2,
          priority: 5,
          qualifier: "1",
          target: "parent",
          time: "normal",
          value: pureUuid(safeUuid),
        };
      }),
    ];
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
        icon: TERIOCK.options.ability.form[this.form].icon,
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
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      form: this.form,
      [`form.${this.form}`]: 1,
      "damage.type": this.damageType.toLowerCase(),
      [`damage.type.${this.damageType.toLowerCase()}`]: 1,
      "damage.extra": this.extraDamage,
    };
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
