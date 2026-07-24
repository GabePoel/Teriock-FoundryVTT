import { mixClasses } from "../../../../helpers/construction.mjs";
import { panelsField } from "../../../fields/tools/builders.mjs";
import * as activations from "../../../pseudo-documents/activations/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseMessageSystem from "../base-message-system/base-message-system.mjs";

const { fields } = foundry.data;

/**
 * Interactive chat message data model.
 * @extends {BaseMessageSystem}
 * @extends {Teriock.Models.InteractiveMessageSystemData}
 * @extends {Teriock.Data.InteractiveMessageData}
 * @mixes ActivatableSystem
 */
export default class InteractiveSystem extends mixClasses(BaseMessageSystem, systemMixins.ActivatableSystemMixin) {
  /** @inheritDoc */
  static get _activationTypes() {
    return Object.values(activations).filter(a => foundry.utils.isSubclass(a, BaseActivation));
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "interactive" });
  }

  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({ categories: ["IMAGE"] }),
      panels: panelsField(),
      source: new fields.DocumentUUIDField(),
      tags: new fields.ArrayField(new fields.StringField()),
    });
  }

  /**
   * The default collapse state for this message's panels.
   * @returns {boolean}
   */
  get collapsedByDefault() {
    const defaultCollapse = game.settings.get("teriock", "defaultPanelCollapseState");
    if (defaultCollapse === "closed") { return true; }
    else if (defaultCollapse === "open") { return false; }
    return this.document.timestamp < Date.now() - game.settings.get("teriock", "autoPanelCollapseTime") * 60 * 1000;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    const element = options.element;
    if (!element) { return; }
    if (this.collapsedByDefault) {
      element.querySelectorAll(".collapsible").forEach(el => {
        el.classList.toggle("collapsed", true);
      });
    }

    // Remove custom content if it shouldn't be visible
    if (!this.document.isContentVisible) {
      element.querySelectorAll(".teriock-target-container, .teriock-dice-total-icon").forEach(el => el.remove());
      element.querySelectorAll(".dice-total.teriock-dice-total").forEach(el => {
        el.className = "dice-total teriock-dice-total";
      });
      element.querySelectorAll(".dice-formula.teriock-dice-formula").forEach(el => {
        el.className = "dice-formula teriock-dice-formula";
      });
      element.querySelectorAll(".dice-total, .dice-formula").forEach(/** @param {HTMLElement} el */ el => {
        delete el.dataset.tooltip;
        delete el.dataset.tooltipHtml;
      });
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    await game.teriock.identifiers.initializing;
    return Object.assign(await super._prepareContext(options), {
      activations: this.activations.contents.filter(a => a?.visible),
    });
  }
}
