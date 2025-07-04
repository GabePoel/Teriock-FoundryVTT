const { api } = foundry.applications;
import { contextMenus } from "./connections/_context-menus.mjs";
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";

/**
 * Ability sheet for Teriock system abilities.
 * Provides comprehensive ability management including consequences, context menus,
 * tag management, and rich text editing for various ability components.
 * @extends {TeriockBaseEffectSheet}
 */
export default class TeriockAbilitySheet extends api.HandlebarsApplicationMixin(TeriockBaseEffectSheet) {
  /**
   * Default options for the ability sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["ability"],
    actions: {
      toggleConsequences: this._toggleConsequences,
      consequenceTab: this._consequenceTab,
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
      template: "systems/teriock/templates/sheets/ability-template/ability-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Creates a new ability sheet instance.
   * Initializes tab state for overview and consequences.
   * @param {...any} args - Arguments to pass to the parent constructor.
   */
  constructor(...args) {
    super(...args);
    this._tab = "overview";
    this._consequenceTab = "base";
  }

  /**
   * Toggles between overview and consequences tabs.
   * @param {Event} event - The event object.
   * @returns {Promise<void>} Promise that resolves when tab is toggled.
   * @static
   */
  static async _toggleConsequences(event) {
    this._tab = this._tab === "consequences" ? "overview" : "consequences";
    this.render();
  }

  /**
   * Switches to a specific consequence tab.
   * @param {Event} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when tab is switched.
   * @static
   */
  static async _consequenceTab(event, target) {
    const tab = target.dataset.tab;
    this._consequenceTab = tab;
    this.render();
  }

  /**
   * Prepares the context data for template rendering.
   * Adds ability-specific data including child abilities, parent ability, and enriched text fields.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const system = this.document.system;
    context.tab = this._tab;
    context.consequenceTab = this._consequenceTab;
    context.childAbilities = await this.document.subsAsync();
    context.parentAbility = this.document.sup;
    const editors = {
      manaCost: system.costs.mp.value.variable,
      hitCost: system.costs.hp.value.variable,
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
      improvement: system.improvement,
    };

    for (const [key, value] of Object.entries(editors)) {
      context[key] = await this._editor(value);
    }

    return context;
  }

  /**
   * Connects event listeners to elements matching a CSS selector.
   * @param {string} cssClass - The CSS selector for elements to connect.
   * @param {string} listener - The event type to listen for.
   * @param {Function} callback - The event handler function.
   */
  _connect(cssClass, listener, callback) {
    this.element.querySelectorAll(cssClass).forEach((el) =>
      el.addEventListener(listener, (event) => {
        event.preventDefault();
        callback(event);
      }),
    );
  }

  /**
   * Connects input elements with automatic updates.
   * @param {HTMLElement} element - The input element to connect.
   * @param {string} attribute - The attribute path to update.
   * @param {Function} callback - Function to transform the input value.
   */
  _connectInput(element, attribute, callback) {
    const update = (event) => {
      const value = callback(event.currentTarget.value);
      this.document.update({ [attribute]: value });
    };

    ["focusout", "change"].forEach((evt) => element.addEventListener(evt, update));
    element.addEventListener("keyup", (e) => e.key === "Enter" && update(e));
  }

  /**
   * Handles the render event for the ability sheet.
   * Sets up context menus, tag management, and button mappings.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  _onRender(context, options) {
    super._onRender(context, options);
    if (!this.editable) return;

    const html = $(this.element);
    this._activateContextMenus();
    this._activateTags(html);
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
      ['.execution-box[maneuver="Active"]', cm.active, "click"],
      ['.execution-box[maneuver="Reactive"]', cm.reactive, "click"],
      [".interaction-box", cm.interaction, "click"],
      [".interaction-box-feat", cm.featSaveAttribute, "contextmenu"],
      [".target-box", cm.targets, "click"],
      [".mana-cost-box", cm.manaCost, "contextmenu"],
      [".hit-cost-box", cm.hitCost, "contextmenu"],
      [".break-cost-box", cm.breakCost, "contextmenu"],
      [".expansion-box", cm.expansion, "click"],
      [".expansion-box-detonate", cm.expansionSaveAttribute, "contextmenu"],
      [".expansion-box-ripple", cm.expansionSaveAttribute, "contextmenu"],
      [".ab-improvement-attribute", cm.attributeImprovement, "click"],
      [".ab-improvement-attribute", cm.attributeImprovementMinVal, "contextmenu"],
      [".ab-improvement-feat-save", cm.featSaveImprovement, "click"],
      [".ab-improvement-feat-save", cm.featSaveImprovementAmount, "contextmenu"],
      [".ability-type-box", cm.abilityType, "click"],
    ];

    for (const [selector, opts, evt] of contextMap) {
      this._connectContextMenu(selector, opts, evt);
    }
  }

  /**
   * Activates tag management for ability flags and properties.
   * Sets up click handlers for boolean flags, array tags, and static updates.
   * @param {jQuery} html - The jQuery element for the sheet.
   */
  _activateTags(html) {
    const doc = this.document;
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
      html.on("click", selector, (e) => {
        e.preventDefault();
        doc.update({ [param]: false });
      });
    }

    const arrayTags = {
      ".element-tag": "system.elements",
      ".power-tag": "system.powerSources",
      ".effect-tag": "system.effects",
    };

    for (const [selector, param] of Object.entries(arrayTags)) {
      this._connect(selector, "click", (e) => {
        const value = e.currentTarget.getAttribute("value");
        const list = doc.system[param.split(".")[1]].filter((e) => e !== value);
        doc.update({ [param]: list });
      });
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
      this._connect(selector, "click", () => doc.update(update));
    }
  }
}
