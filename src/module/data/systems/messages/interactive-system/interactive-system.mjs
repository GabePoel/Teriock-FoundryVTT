import { mixClasses } from "../../../../helpers/construction.mjs";
import { panelsField, targetGroupField } from "../../../fields/tools/builders.mjs";
import { migrateKey } from "../../../migrations/source-migrations.mjs";
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
      targetGroups: new fields.ArrayField(targetGroupField()),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    for (const panel of source.panels ?? []) { migrateKey(panel, "image", "img"); }
    return super.migrateData(source, options, state);
  }

  /**
   * Prepare the render context for a single target group.
   * @param {Teriock.Models.TargetGroup} group
   * @returns {Promise<Teriock.Models.TargetGroupContext>}
   */
  async #prepareTargetGroupContext(group) {
    const isPrivate = !this.document.isContentVisible;
    /** @type {Teriock.Models.TargetGroupContext} */
    const context = { hasRoll: Boolean(group.roll), targets: group.targets };
    if (group.roll) {
      Object.assign(context, await group.roll._prepareChatRenderContext({ isPrivate, message: this.document }));
      if (isPrivate) { context.hideRoll = false; }
    }
    context.flavor = group.flavor || context.flavor || "";
    return context;
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

  /**
   * Every roll stored in this message's target groups.
   * @returns {BaseRoll[]}
   */
  get rolls() {
    return this.targetGroups.map(g => g.roll).filter(r => Boolean(r));
  }

  /**
   * Every target across all of this message's target groups.
   * @returns {Teriock.Models.Target[]}
   */
  get targets() {
    return this.targetGroups.flatMap(t => t.targets);
  }

  /** @inheritDoc */
  get visible() {
    if (this.parent.whisper.length) {
      return this.parent.isAuthor || this.parent.whisper.includes(game.user.id);
    }
    return true;
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
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (game?.dice3d && this.rolls.length) {
      await Promise.all(
        this.rolls.map(r =>
          game.dice3d.showForRoll(
            r,
            user,
            true,
            this.parent.whisper,
            this.parent.blind,
            this.parent.speaker,
            this.parent.id,
          )
        ),
      );
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    await game.teriock.identifiers.initializing;
    return Object.assign(await super._prepareContext(options), {
      activations: this.activations.contents.filter(a => a?.visible),
      targetGroups: await Promise.all(this.targetGroups.map(g => this.#prepareTargetGroupContext(g))),
    });
  }
}
