import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { elementClass } from "../../../../helpers/html.mjs";
import { systemPath } from "../../../../helpers/path.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSheet from "../base-effect-sheet.mjs";
import abilityContextMenus from "./helpers/ability-context-menus.mjs";

/**
 * Sheet for a {@link TeriockAbility}.
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
  /** @inheritDoc */
  static BARS = [
    systemPath("templates/sheets/effects/ability/status-bar.hbs"),
    systemPath("templates/sheets/effects/ability/delivery-bar.hbs"),
    systemPath("templates/sheets/effects/ability/targeting-bar.hbs"),
    systemPath("templates/sheets/effects/ability/expansion-bar.hbs"),
    systemPath("templates/sheets/effects/ability/costs-bar.hbs"),
    systemPath("templates/sheets/shared/bars/consumable-bar.hbs"),
  ];

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

  /** @inheritDoc */
  static PARTS = {
    mask: {
      template: systemPath(
        "templates/sheets/effects/ability/elder-sorcery-mask.hbs",
      ),
    },
    ...this.HEADER_PARTS,
    menu: {
      template: systemPath("templates/sheets/effects/ability/menu.hbs"),
    },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  get _buttonUpdates() {
    return {
      ...super._buttonUpdates,
      ".ab-attribute-improvement-button": {
        "system.upgrades.score.attribute": "int",
      },
      ".ab-break-cost-button": { "system.costs.break": "shatter" },
      ".ab-expansion-button": { "system.expansion": "detonate" },
      ".ab-expansion-cap-button": { "system.expansion.cap.raw": "1" },
      ".ab-feat-save-improvement-button": {
        "system.upgrades.competence.attribute": "int",
        "system.upgrades.competence.value": 1,
      },
      ".ab-gold-cost-button": {
        "system.costs.gp": {
          type: "formula",
          value: { static: 0, formula: "1d100", variable: "" },
        },
      },
      ".ab-hit-cost-button": {
        "system.costs.hp": {
          type: "static",
          value: { static: 1, formula: "", variable: "" },
        },
      },
      ".ab-mana-cost-button": {
        "system.costs.mp": {
          type: "static",
          value: { static: 1, formula: "", variable: "" },
        },
      },
    };
  }

  /**
   * Reset the elder sorcery elements that this sheet's window has.
   */
  #resetElderSorceryElements() {
    this.window.content.classList.remove(
      "es-life",
      "es-storm",
      "es-necro",
      "es-flame",
      "es-nature",
      "es-multi",
    );
    if (this.document.system.elderSorcery) {
      this.window.content.classList.add(
        elementClass(this.document.system.elements),
      );
    }
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
      [".mana-cost-box", cm.manaCost, "contextmenu"],
      [".hit-cost-box", cm.hitCost, "contextmenu"],
      [".gold-cost-box", cm.goldCost, "contextmenu"],
      [".break-cost-box", cm.breakCost, "contextmenu"],
      [".expansion-box", cm.expansion, "click"],
      [".expansion-box-detonate", cm.expansionSaveAttribute, "contextmenu"],
      [".expansion-box-ripple", cm.expansionSaveAttribute, "contextmenu"],
      [".form-type-box", cm.form, "click"],
    ];

    for (const [selector, opts, evt] of contextMap) {
      this._connectContextMenu(selector, opts, evt);
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) return;
    this._activateContextMenus();
    this.#resetElderSorceryElements();
  }

  /** @inheritDoc */
  async _renderFrame(options = {}) {
    const frame = await super._renderFrame(options);
    this.#resetElderSorceryElements();
    return frame;
  }
}
