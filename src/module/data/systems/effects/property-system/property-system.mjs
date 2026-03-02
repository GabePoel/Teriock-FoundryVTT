import { mix } from "../../../../helpers/utils.mjs";
import { FormulaField, TextField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {BaseEffectSystem}
 * @extends {ChildSystem}
 * @extends {CommonSystem}
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
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Property",
  ];

  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.ChangesAutomation,
      automations.CheckAutomation,
      automations.CommonImpactsAutomation,
      automations.HacksAutomation,
      automations.PropertyMacroAutomation,
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
        "system.competence",
        "system.hierarchy",
        "system.improvement",
        "system.limitation",
        "system.tag",
      ],
      type: "property",
      visibleTypes: ["property"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      applyIfDampened: new fields.BooleanField({ initial: false }),
      applyIfShattered: new fields.BooleanField({ initial: false }),
      damageType: new fields.StringField({ initial: "" }),
      extraDamage: new FormulaField({ deterministic: false }),
      form: new fields.StringField({ initial: "normal" }),
      improvement: new TextField({ initial: "" }),
      limitation: new TextField({ initial: "" }),
      modifiesActor: new fields.BooleanField({ initial: false }),
      tag: new fields.StringField({ initial: "" }),
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
    if (!suppressed && this.parent.parent?.type === "equipment") {
      if (this.parent.parent?.system.stashed) {
        suppressed = true;
      }
      if (
        !suppressed &&
        !this.parent.parent?.system.equipped &&
        this.modifies === "Actor"
      ) {
        suppressed = true;
      }
      if (
        !suppressed &&
        this.parent.parent?.system.dampened &&
        this.form !== "intrinsic" &&
        !this.applyIfDampened
      ) {
        suppressed = true;
      }
    }
    if (
      !suppressed &&
      this.parent.parent?.system.shattered &&
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
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",
        ),
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
    let suffix = "";
    if (this.tag && this.tag.length > 0) {
      suffix = `: ${this.tag}`;
    }
    if (this.limitation && this.limitation.length > 0) {
      additions.push(
        game.i18n.localize("TERIOCK.SYSTEMS.BaseEffect.NAME.limited"),
      );
    }
    if (this.improvement && this.improvement.length > 0) {
      additions.push(
        game.i18n.localize("TERIOCK.SYSTEMS.BaseEffect.NAME.improved"),
      );
    }
    if (!this.revealed) {
      additions.push(
        game.i18n.localize("TERIOCK.SYSTEMS.BaseEffect.NAME.unrevealed"),
      );
    }
    let nameAddition = "";
    if (additions.length > 0) {
      nameAddition = ` (${additions.join(", ")})`;
    }
    return this.parent.name.trim() + suffix + nameAddition;
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
}
