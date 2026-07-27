import { icons } from "../../constants/display/icons.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { makeIcon } from "../../helpers/icon.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { TokenDocument } = foundry.documents;

/**
 * The Teriock TokenDocument implementation.
 * @extends {TokenDocument}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 * @implements {Teriock.Documents.TokenDocumentInterface}
 */
export default class TeriockTokenDocument
  extends mixClasses(TokenDocument, documentMixins.BaseDocumentMixin, documentMixins.EmbedCardDocumentMixin)
{
  /** @inheritDoc */
  get embedParts() {
    const parts = Object.assign(super.embedParts, { icon: icons.document.token, img: this.img });
    if (this.actor && this.actor.fullName !== parts.title) { parts.text = this.actor.fullName; }
    return parts;
  }

  /**
   * The image that should be used to represent this token.
   * @returns {string}
   */
  get img() {
    // Non-ring textures are preferred over ring ones because of sizing issues.
    // No special handling is needed if this doesn't have a dynamic ring.
    if (!this.ring.enabled) { return this.texture.src; }
    // If texture is being modified, assume it is intentional and use that.
    if (this.texture.src && this._source.texture.src !== this.texture.src) { return this.texture.src; }
    // If ring texture is being modified, assume it is intentional and use that.
    if (
      this.ring.enabled && this.ring.subject.texture && this._source.ring.subject.texture !== this.ring.subject.texture
    ) { return this.ring.subject.texture; }
    // If this has an actor, additional validation is needed.
    const actor = this.actor;
    if (actor) {
      // If this is using the original texture given by the actor, use the actor's art.
      if (actor.constructor.getDefaultImageForType(actor.type) === this.texture.src) { return actor.img; }
      // If this is using the default token art, use the actor's art.
      if (this.texture.src === CONST.DEFAULT_TOKEN) { return actor.img; }
    }
    // Only use the ring texture if it really is the best one.
    if (this.ring.subject.texture) { return this.ring.subject.texture; }
    // Use the source texture if needed.
    return this.texture.src;
  }

  /**
   * @inheritDoc
   * @see {InfiniteNumberField}
   */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
    const actor = this.actor;
    if (!actor) { return; }
    // Detection modes and range can't be changes since NumberField has no way to be set to null/Infinity via change.
    const autoDetectionMode = actor.system.settings.getSetting("autoDetectionModes");
    const autoVisionRange = actor.system.settings.getSetting("autoVisionRange");
    if (autoDetectionMode || autoVisionRange) {
      this.sight.range = 0;
      for (const [id, config] of Object.entries(TERIOCK.config.character.sense)) {
        const range = actor.system.senses[id];
        if (autoDetectionMode) {
          const mode = config?.detectionMode;
          if (mode) { this.detectionModes[mode] = { enabled: range > 0, range }; }
        }
        if (autoVisionRange && config?.grantsSight) { this.sight.range = Math.max(this.sight.range, range); }
      }
    }
    if (this.detectionModes.basicSight) { this.detectionModes.basicSight.enabled = false; }
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [{
      icon: makeIcon(TERIOCK.config.document.character.icon, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
      onClick: async () => this.actor.sheet.render(true),
      visible: () => this.actor && this.actor.isViewer,
    }, ...super.getCardContextMenuEntries(doc)];
  }

  /**
   * Perform all updates needed to synchronize this with {@link TeriockActor} data.
   * @returns {Promise<void>}
   */
  async postActorUpdate() {
    const updateData = {};
    const updateOptions = {};
    if (this.actor) {
      if (this.actor.system.settings.getSetting("autoScale")) {
        if (this.width !== this.actor.system.size.length) { updateData.width = this.actor.system.size.length; }
        if (this.height !== this.actor.system.size.length) { updateData.height = this.actor.system.size.length; }
      }
    }
    if (Object.keys(updateData).length > 0 && this.id) { await this.update(updateData, updateOptions); }
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    if (this.isLazyDelta) { return; }
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects(TERIOCK.config.change.defaultPhase);
  }
}
