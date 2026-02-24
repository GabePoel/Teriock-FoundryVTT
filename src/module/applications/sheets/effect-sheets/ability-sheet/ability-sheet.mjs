import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import abilityContextMenus from "./helpers/ability-context-menus.mjs";

/**
 * {@link TeriockAbility} sheet.
 * @property {TeriockAbility} document
 * @extends {BaseEffectSheet}
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class AbilitySheet extends mix(
  BaseEffectSheet,
  mixins.UseButtonSheetMixin,
  mixins.WikiButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["ability"],
    window: {
      icon: makeIconClass(documentOptions.ability.icon, "title"),
    },
  };

  /**
   * Template parts configuration for the ability sheet.
   * @type {object}
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
      [".mana-cost-box", cm.manaCost, "contextmenu"],
      [".hit-cost-box", cm.hitCost, "contextmenu"],
      [".gold-cost-box", cm.goldCost, "contextmenu"],
      [".break-cost-box", cm.breakCost, "contextmenu"],
      [".expansion-box", cm.expansion, "click"],
      [".expansion-box-detonate", cm.expansionSaveAttribute, "contextmenu"],
      [".expansion-box-ripple", cm.expansionSaveAttribute, "contextmenu"],
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
    const staticUpdates = {
      ".ab-attribute-improvement-button": {
        "system.upgrades.score.attribute": "int",
      },
      ".ab-break-cost-button": {
        "system.costs.break": "shatter",
      },
      ".ab-es-incant-button": {
        "system.elderSorceryIncant": game.i18n.localize(
          "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorceryIncant.default",
        ),
        "system.elderSorcery": true,
      },
      ".ab-expansion-button": {
        "system.expansion": "detonate",
      },
      ".ab-expansion-cap-button": {
        "system.expansion.cap.raw": "1",
      },
      ".ab-feat-save-improvement-button": {
        "system.upgrades.competence.attribute": "int",
        "system.upgrades.competence.value": 1,
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
    if (!this.isEditable) return;
    this._activateContextMenus();
    this._activateTags();
  }
}
