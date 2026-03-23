import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { elementClass } from "../../../../helpers/html.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSheet from "../base-effect-sheet.mjs";
import abilityContextMenus from "./helpers/ability-context-menus.mjs";

/**
 * Sheet for a {@link TeriockAbility}.
 * @property {TeriockAbility} document
 * @extends {BaseEffectSheet}
 * @mixes WikiButtonSheet
 */
export default class AbilitySheet extends mix(
  BaseEffectSheet,
  mixins.WikiButtonSheetMixin,
) {
  /** @inheritDoc */
  static BARS = [
    "teriock/sheets/effects/ability/status-bar",
    "teriock/sheets/effects/ability/delivery-bar",
    "teriock/sheets/effects/ability/targeting-bar",
    "teriock/sheets/effects/ability/expansion-bar",
    "teriock/sheets/effects/ability/costs-bar",
    "teriock/sheets/effects/ability/tweaks-bar",
    "teriock/sheets/shared/bars/consumable-bar",
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
    mask: { template: "teriock/sheets/effects/ability/elder-sorcery-mask" },
    ...this.HEADER_PARTS,
    menu: { template: "teriock/sheets/effects/ability/menu" },
    ...this.CONTENT_PARTS,
  };

  /** @inheritDoc */
  get _buttonUpdates() {
    return {
      ...super._buttonUpdates,
      ".ab-attribute-improvement-button": {
        "system.upgrades.score.attribute": "int",
      },
      ".ab-expansion-button": { "system.expansion": "detonate" },
      ".ab-expansion-cap-button": { "system.expansion.cap.raw": "1" },
      ".ab-feat-save-improvement-button": {
        "system.upgrades.competence.attribute": "int",
        "system.upgrades.competence.value": 1,
      },
      ...Object.fromEntries(
        Object.keys(TERIOCK.options.cost.tweaks).map((k) => [
          `.ab-tweak-${k}-button`,
          { [`system.costs.tweaks.${k}`]: 1 },
        ]),
      ),
    };
  }

  /**
   * Reset the elder sorcery elements that this sheet's window has.
   */
  #resetElderSorceryElements() {
    this.window.content.classList.remove(
      ...Object.keys(TERIOCK.reference.elements).map((e) => `es-${e}`),
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
