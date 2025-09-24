import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { durationDialog } from "../../../dialogs/_module.mjs";
import { PassiveSheetMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { contextMenus } from "./connections/_context-menus.mjs";

/**
 * Ability sheet for Teriock system abilities.
 * Provides comprehensive ability management including consequences, context menus,
 * tag management, and rich text editing for various ability components.
 * @property {TeriockAbility} document
 * @extends {TeriockBaseEffectSheet}
 * @mixes PassiveSheetMixin
 */
export default class TeriockAbilitySheet extends PassiveSheetMixin(
  TeriockBaseEffectSheet,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["ability"],
    actions: {
      setDuration: this._setDuration,
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
   * @private
   */
  static async _setDuration() {
    if (!this.editable) {
      return;
    }
    await durationDialog(this.document);
  }

  /**
   * Activates context menus for various ability components.
   * Sets up context menus for delivery, execution, interaction, targets, costs, and improvements.
   */
  _activateContextMenus() {
    const cm = contextMenus(this.document);
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
    if (!this.editable) {
      return;
    }

    this._activateContextMenus();
    this._activateTags();
    const buttonMap = {
      ".ab-material-cost-button": "system.costs.materialCost",
      ".ab-trigger-button": "system.trigger",
      ".ab-limitation-button": "system.limitation",
      ".ab-improvement-button": "system.improvement",
      ".ab-base-button": "system.overview.base",
      ".ab-proficient-button": "system.overview.proficient",
      ".ab-fluent-button": "system.overview.fluent",
      ".ab-heightened-button": "system.heightened",
      ".ab-crit-hit-button": "system.results.critHit",
      ".ab-hit-button": "system.results.hit",
      ".ab-miss-button": "system.results.miss",
      ".ab-crit-miss-button": "system.results.critMiss",
      ".ab-crit-fail-button": "system.results.critFail",
      ".ab-fail-button": "system.results.fail",
      ".ab-save-button": "system.results.save",
      ".ab-crit-save-button": "system.results.critSave",
      ".ab-end-condition-button": "system.endCondition",
      ".ab-requirements-button": "system.requirements",
    };
    this._connectButtonMap(buttonMap);

    /** @type {NodeListOf<HTMLInputElement|HTMLSelectElement>} */
    const elements = this.element.querySelectorAll(".change-box-entry");

    elements.forEach((entry) => {
      entry.addEventListener("change", async () => {
        const index = parseInt(entry.dataset.index, 10);
        const key = entry.dataset.key;
        const application = entry.dataset.application;
        const updateString = `system.applies.${application}.changes`;
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
        const changes = this.document.system.applies[application].changes;
        if (index >= 0 && index < changes.length) {
          changes[index][key] = value;
          await this.document.update({ [updateString]: changes });
        }
      });
    });
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.document.system;
    context.tab = this._tab;
    context.subAbilities = this.document.subs;
    context.supAbility = this.document.sup;
    const effectsSet = new Set(system.effectTypes);
    //noinspection JSUnresolvedReference
    context.effectTags = Array.from(
      effectsSet.difference(new Set(system.powerSources)),
    );
    await this._enrichAll(context, {
      mpCost: system.costs.mp.value.variable,
      hpCost: system.costs.hp.value.variable,
      gpCost: system.costs.gp.value.variable,
      materialCost: system.costs.materialCost,
      trigger: system.trigger,
      baseOverview: system.overview.base,
      proficientOverview: system.overview.proficient,
      fluentOverview: system.overview.fluent,
      heightened: system.heightened,
      onCriticalHit: system.results.critHit,
      onHit: system.results.hit,
      onMiss: system.results.miss,
      onCriticalMiss: system.results.critMiss,
      onCriticalFail: system.results.critFail,
      onFail: system.results.fail,
      onSave: system.results.save,
      onCriticalSave: system.results.critSave,
      endCondition: system.endCondition,
      requirements: system.requirements,
      elderSorceryIncant: system.elderSorceryIncant,
      limitation: system.limitation,
      grantOnly: system.grantOnlyText,
      improvement: system.improvement,
      attributeImprovement: system.attributeImprovementText,
      featSaveImprovement: system.featSaveImprovementText,
    });
    return context;
  }
}
