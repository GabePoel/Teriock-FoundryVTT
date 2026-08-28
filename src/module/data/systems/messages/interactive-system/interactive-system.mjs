import { mixClasses } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";
import * as activations from "../../../pseudo-documents/activations/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseMessageSystem from "../base-message-system/base-message-system.mjs";

const { fields } = foundry.data;

/**
 * @import { DataField } from "@common/data/fields.mjs";
 */

/**
 * Interactive chat message data model.
 * @implements {Teriock.Data.InteractiveMessageData}
 * @mixes ActivatableSystem
 */
export default class InteractiveSystem extends mixClasses(BaseMessageSystem, systemMixins.ActivatableSystemMixin) {
  /** @inheritDoc */
  static get _activationTypes() {
    return Object.values(activations).filter(a => foundry.utils.isSubclass(a, BaseActivation));
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { pseudos: { Panel: "system.panels" }, type: "interactive" });
  }

  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({ categories: ["IMAGE"] }),
      panels: new PseudoCollectionField(Panel),
      restrictVisibility: new fields.BooleanField({ initial: true }),
      source: new fields.DocumentUUIDField(),
      tags: new fields.ArrayField(new fields.StringField()),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (Array.isArray(source.panels)) {
      const panels = {};
      for (const panel of source.panels) {
        panel._id ??= foundry.utils.randomID();
        panels[panel._id] = panel;
      }
      source.panels = panels;
    }
    return super.migrateData(source, options);
  }

  /**
   * Enriched panel context.
   * @returns {Promise<Teriock.Panels.PanelParts[]>}
   */
  async #preparePanelContext() {
    if (!this.parent.isContentVisible) { return [TERIOCK.display.panel.premade]; }
    const relativeTo = await fromUuid(this._src) ?? this.parent.speakerActor;
    return Promise.all(
      this.panels.contents.map(p => p?.prepareContext({ relativeTo, secrets: relativeTo?.isOwner ?? game.user.isGM })),
    );
  }

  /**
   * The default collapse state for this message's panels.
   * @returns {boolean}
   */
  get collapsedByDefault() {
    const defaultCollapse = game.settings.get("teriock", "defaultPanelCollapseState");
    if (defaultCollapse === "closed") { return true; }
    else if (defaultCollapse === "open") { return false; }
    return this.document.timestamp
      < Date.now() - (game.settings.get("teriock", "autoPanelCollapseTime") ?? Infinity) * 60 * 1000;
  }

  /**
   * Show activations.
   * @return {boolean}
   */
  get showActivations() {
    return this.activations.contents.some(a => a?.visible) && this.parent.isContentVisible;
  }

  /**
   * Show panels.
   * @return {0|boolean}
   */
  get showPanels() {
    return this.panels.size && (this.parent.isAuthor || this.parent.isContentVisible);
  }

  /**
   * Show tags.
   * @return {boolean}
   */
  get showTags() {
    return this.tags.length && this.parent.isContentVisible;
  }

  /** @inheritDoc */
  get visible() {
    if (this.restrictVisibility && this.parent.whisper.length) {
      return this.parent.isAuthor || this.parent.whisper.includes(game.user.id);
    }
    return super.visible;
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
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    await game.teriock.identifiers.initializing;
    return Object.assign(await super._prepareContext(options), {
      activations: this.activations.contents.filter(a => a?.visible),
      hideContent: !this.parent.isContentVisible && !this.parent.rolls.length,
      panels: await this.#preparePanelContext(),
      showActivations: this.showActivations,
      showPanels: this.showPanels,
      showTags: this.showTags,
    });
  }
}
