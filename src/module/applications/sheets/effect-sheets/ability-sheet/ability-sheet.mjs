import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import { durationDialog } from "../../../dialogs/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import abilityContextMenus from "./helpers/ability-context-menus.mjs";

/**
 * {@link TeriockAbility} sheet.
 * @property {TeriockAbility} document
 * @extends {TeriockBaseEffectSheet}
 * @mixes PassiveSheet
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class TeriockAbilitySheet extends mix(
  TeriockBaseEffectSheet,
  mixins.PassiveSheetMixin,
  mixins.UseButtonSheetMixin,
  mixins.WikiButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["ability"],
    actions: {
      setDuration: this._onSetDuration,
    },
    window: {
      icon: `fa-solid fa-${documentOptions.ability.icon}`,
    },
  };

  /**
   * Template parts configuration for the ability sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/effect-templates/ability-template/ability-template.hbs",
      scrollable: [
        ".ab-sheet-everything",
        ".ab-impacts-tab",
        ".es-mask-rotator",
      ],
    },
  };

  /**
   * Set the duration for this ability.
   * @returns {Promise<void>}
   */
  static async _onSetDuration() {
    if (!this.isEditable) {
      return;
    }
    await durationDialog(this.document);
  }

  /**
   * Activates context menus for various ability components.
   * Sets up context menus for delivery, execution, interaction, targets, costs, and improvements.
   */
  _activateContextMenus() {
    const cm = abilityContextMenus(this.document);
    const contextMap = [
      [".delivery-box", cm.delivery, "click"],
      [".delivery-box", cm.piercing, "contextmenu"],
      [".execution-box", cm.maneuver, "contextmenu"],
      ['.execution-box[data-maneuver="Active"]', cm.active, "click"],
      ['.execution-box[data-maneuver="Reactive"]', cm.reactive, "click"],
      [".interaction-box", cm.interaction, "click"],
      [".interaction-box-feat", cm.featSaveAttribute, "contextmenu"],
      [".target-box", cm.targets, "click"],
      [".mana-cost-box", cm.manaCost, "contextmenu"],
      [".hit-cost-box", cm.hitCost, "contextmenu"],
      [".gold-cost-box", cm.goldCost, "contextmenu"],
      [".break-cost-box", cm.breakCost, "contextmenu"],
      [".expansion-box", cm.expansion, "click"],
      [".expansion-box-detonate", cm.expansionSaveAttribute, "contextmenu"],
      [".expansion-box-ripple", cm.expansionSaveAttribute, "contextmenu"],
      [".ab-improvement-attribute", cm.attributeImprovement, "click"],
      [
        ".ab-improvement-attribute",
        cm.attributeImprovementMinVal,
        "contextmenu",
      ],
      [".ab-improvement-feat-save", cm.featSaveImprovement, "click"],
      [
        ".ab-improvement-feat-save",
        cm.featSaveImprovementAmount,
        "contextmenu",
      ],
      [".ability-type-box", cm.form, "click"],
    ];

    for (const [selector, opts, evt] of contextMap) {
      this._connectContextMenu(selector, opts, evt);
    }
  }

  /**
   * Activates tag management for ability flags and properties.
   * Sets up click handlers for boolean flags, array tags, and static updates.
   */
  _activateTags() {
    const doc = this.document;
    const root = this.element;

    const tags = {
      ".flag-tag-basic": "system.basic",
      ".flag-tag-sustained": "system.sustained",
      ".flag-tag-standard": "system.standard",
      ".flag-tag-skill": "system.skill",
      ".flag-tag-spell": "system.spell",
      ".flag-tag-ritual": "system.ritual",
      ".flag-tag-rotator": "system.rotator",
      ".flag-tag-invoked": "system.costs.invoked",
      ".flag-tag-verbal": "system.costs.verbal",
      ".flag-tag-somatic": "system.costs.somatic",
      ".flag-elder-sorcery": "system.elderSorcery",
    };

    for (const [selector, param] of Object.entries(tags)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", async () => {
          await doc.update({ [param]: false });
        });
      });
    }

    const arrayTags = {
      ".element-tag": "system.elements",
      ".power-tag": "system.powerSources",
      ".effect-tag": "system.effectTypes",
    };

    for (const [selector, param] of Object.entries(arrayTags)) {
      root.querySelectorAll(selector).forEach(
        /** @param {HTMLElement} el */ (el) => {
          el.addEventListener("click", async () => {
            const value = el.dataset.value;
            const pathKey = param.split(".")[1];
            const list = doc.system[pathKey].filter((entry) => entry !== value);
            await doc.update({ [param]: list });
          });
        },
      );
    }

    const staticUpdates = {
      ".ab-es-incant-button": {
        "system.elderSorceryIncant": "Incant.",
        "system.elderSorcery": true,
      },
      ".ab-expansion-button": {
        "system.expansion": "detonate",
      },
      ".ab-mana-cost-button": {
        "system.costs.mp": {
          type: "static",
          value: {
            static: 1,
            formula: "",
            variable: "",
          },
        },
      },
      ".ab-hit-cost-button": {
        "system.costs.hp": {
          type: "static",
          value: {
            static: 1,
            formula: "",
            variable: "",
          },
        },
      },
      ".ab-gold-cost-button": {
        "system.costs.gp": {
          type: "formula",
          value: {
            static: 0,
            formula: "1d100",
            variable: "",
          },
        },
      },
      ".ab-break-cost-button": {
        "system.costs.break": "shatter",
      },
      ".ab-attribute-improvement-button": {
        "system.improvements.attributeImprovement.attribute": "int",
      },
      ".ab-feat-save-improvement-button": {
        "system.improvements.featSaveImprovement.attribute": "int",
      },
    };

    for (const [selector, update] of Object.entries(staticUpdates)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => doc.update(update));
      });
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) {
      return;
    }

    this._activateContextMenus();
    this._activateTags();

    /** @type {NodeListOf<HTMLInputElement|HTMLSelectElement>} */
    const elements = this.element.querySelectorAll(".change-box-entry");

    elements.forEach((entry) => {
      entry.addEventListener("change", async () => {
        const index = parseInt(entry.dataset.index, 10);
        const key = entry.dataset.key;
        const application = entry.dataset.application;
        const updateString = `system.impacts.${application}.changes`;
        let value = entry.value;
        if (!isNaN(Number(value)) && value !== "") {
          const intValue = parseInt(value, 10);
          if (!isNaN(intValue) && intValue.toString() === value.trim()) {
            value = intValue;
          }
        }
        if (
          typeof value === "string" &&
          value.trim() !== "" &&
          !isNaN(Number(value))
        ) {
          value = Number(value);
        }
        const changes = this.document.system.impacts[application].changes;
        if (index >= 0 && index < changes.length) {
          changes[index][key] = value;
          await this.document.update({ [updateString]: changes });
        }
      });
    });
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    const system = this.document.system;
    context.tab = this._tab;
    const effectsSet = new Set(system.effectTypes);
    //noinspection JSUnresolvedReference
    context.effectTags = Array.from(
      effectsSet.difference(new Set(system.powerSources)),
    );
    return context;
  }
}
