import { createElement, elementClass } from "../../../helpers/html.mjs";
import { listFormat } from "../../../helpers/localization.mjs";
import {
  AbilityDeliveryUpdater,
  AbilityExecutionTimeUpdater,
  AbilityExpansionUpdater,
  AbilityInteractionUpdater,
} from "../../dialogs/updaters/_module.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Sheet for a {@link TeriockAbility}.
 * @property {TeriockAbility} document
 */
export default class AbilitySheet extends ChildSheet {
  /**
   * Open the delivery updater.
   * @returns {Promise<void>}
   */
  static async #onEditDelivery() {
    await AbilityDeliveryUpdater.create({ document: this.document });
  }

  /**
   * Open the execution time updater.
   * @returns {Promise<void>}
   */
  static async #onEditExecutionTime() {
    await AbilityExecutionTimeUpdater.create({ document: this.document });
  }

  /**
   * Open the expansion configuration dialog.
   * @returns {Promise<void>}
   */
  static async #onEditExpansion() {
    await AbilityExpansionUpdater.create({ document: this.document });
  }

  /**
   * Open the interaction updater.
   * @returns {Promise<void>}
   */
  static async #onEditInteraction() {
    await AbilityInteractionUpdater.create({ document: this.document });
  }

  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/effects/ability/status-bar",
    "teriock/sheets/effects/ability/delivery-bar",
    "teriock/sheets/effects/ability/targeting-bar",
    "teriock/sheets/effects/ability/expansion-bar",
    "teriock/sheets/effects/ability/costs-bar",
    "teriock/sheets/effects/ability/tweaks-bar",
    "teriock/sheets/shared/bars/consumable-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: {
      editDelivery: this.#onEditDelivery,
      editExecutionTime: this.#onEditExecutionTime,
      editExpansion: this.#onEditExpansion,
      editInteraction: this.#onEditInteraction,
    },
    classes: ["ability"],
  };

  /**
   * Reset elder sorcery theme classes, scroll wrapper, and mask element.
   */
  #resetElderSorceryElements() {
    const { content } = this.window;
    const elementClasses = [...Object.keys(TERIOCK.reference.elements).map(e => `es-${e}`), "es-multi"];
    content.classList.remove(...elementClasses);
    content.querySelector(":scope > .es-mask-rotator")?.remove();

    if (!this.document.system.elderSorcery) {
      const scroll = content.querySelector(":scope > .teriock-sheet-everything");
      if (scroll) {
        while (scroll.firstChild) { content.insertBefore(scroll.firstChild, scroll); }
        scroll.remove();
      }
      return;
    }

    content.classList.add(elementClass(this.document.system.elements));

    let scroll = content.querySelector(":scope > .teriock-sheet-everything");
    if (!scroll) {
      scroll = createElement("div", { className: "teriock-sheet-everything" });
      content.appendChild(scroll);
    }
    for (const child of [...content.children]) {
      if (child === scroll || child.classList.contains("es-mask-rotator")) { continue; }
      scroll.appendChild(child);
    }

    content.prepend(createElement("div", { className: "es-mask-rotator" }));
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#resetElderSorceryElements();
    if (!this.isEditable) { return; }
    this._connectBuildContextMenu(".form-type-box", TERIOCK.config.effect.form, "system.form", "click");
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    let time;
    const maneuver = this.document.system.maneuver;
    const executionTime = this.document.system.executionTime;
    if (maneuver === "active") { time = TERIOCK.config.ability.executionTime.active[executionTime.base]; }
    else if (maneuver === "reactive") { time = TERIOCK.config.ability.executionTime.reactive[executionTime.base]; }
    else if (maneuver === "passive") { time = TERIOCK.config.ability.executionTime.passive.passive; }
    else { time = executionTime.slow.text; }
    const targetString = listFormat(this.document.system.targets.map(t => TERIOCK.config.ability.targets[t]?.label), {
      type: "unit",
    });
    return Object.assign(context, { executionTime: time, targetString });
  }

  /** @inheritDoc */
  async _renderFrame(options = {}) {
    const frame = await super._renderFrame(options);
    this.#resetElderSorceryElements();
    return frame;
  }
}
