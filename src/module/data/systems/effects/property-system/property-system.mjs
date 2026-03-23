import { mix } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.PropertySystemData}
 * @mixes AdjustableSystem
 * @mixes RevelationSystem
 * @mixes WikiSystem
 */
export default class PropertySystem extends mix(
  BaseEffectSystem,
  mixins.AdjustableSystemMixin,
  mixins.WikiSystemMixin,
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
      automations.UseLocalDocumentsAutomation,
      automations.UseExternalDocumentsAutomation,
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
      material: new fields.BooleanField({ initial: false }),
      modifiesActor: new fields.BooleanField({ initial: false }),
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
    return TERIOCK.options.effect.form[this.form].color;
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", ...this.constructor._adjustableTextFields];
  }

  /** @inheritDoc */
  get displayTags() {
    const tags = super.displayTags;
    if (this.material) {
      tags.push("TERIOCK.SYSTEMS.Property.FIELDS.material.label");
    }
    if (this.mundane) {
      tags.push("TERIOCK.SYSTEMS.Adjustable.FIELDS.mundane.label");
    }
    return tags;
  }

  /** @inheritDoc */
  get displayToggles() {
    return [
      "system.applyIfShattered",
      "system.applyIfDampened",
      "system.modifiesActor",
      "system.mundane",
      "system.material",
      ...super.displayToggles,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.options.effect.form[this.form].name;
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
        !this.mundane &&
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
        icon: TERIOCK.options.effect.form[this.form].icon,
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",
        ),
        wrappers: [
          TERIOCK.options.effect.form[this.form].name,
          this.material
            ? game.i18n.localize(
                "TERIOCK.SYSTEMS.Property.FIELDS.material.label",
              )
            : "",
          this.mundane
            ? game.i18n.localize(
                "TERIOCK.SYSTEMS.Adjustable.FIELDS.mundane.label",
              )
            : "",
        ],
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
