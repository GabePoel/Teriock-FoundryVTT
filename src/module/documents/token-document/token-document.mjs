import { icons } from "../../constants/display/icons.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { makeIcon } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TokenDocument } = foundry.documents;

/**
 * The Teriock TokenDocument implementation.
 * @implements {Teriock.Documents.TokenDocumentInterface}
 * @extends {TokenDocument}
 * @extends {ClientDocument}
 * @mixes EmbedCardDocument
 * @mixes BaseDocument
 * @mixes SettingsDocument
 */
export default class TeriockTokenDocument
  extends mixClasses(TokenDocument, mixins.BaseDocumentMixin, mixins.EmbedCardDocumentMixin)
{
  /** @inheritDoc */
  get embedParts() {
    const parts = Object.assign(super.embedParts, { icon: icons.document.token, img: this.img });
    if (this.actor && this.actor.fullName !== parts.title) parts.text = this.actor.fullName;
    return parts;
  }

  /**
   * The image that should be used to represent this token.
   * @returns {string}
   */
  get img() {
    return this.texture.src;
  }

  /**
   * Rescale the src if this has a token ring.
   * @returns {boolean}
   */
  get rescale() {
    return !!this.ring.enabled;
  }

  /** @inheritDoc */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
    const basicMode = this.detectionModes.basicSight;
    if (basicMode) basicMode.enabled = false;
    if (this.detectionModes?.lightPerception) {
      this.detectionModes.lightPerception.enabled = true;
      this.detectionModes.lightPerception.range = Infinity;
    }
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
      if (this.actor.getSetting("token.autoScale")) {
        if (this.width !== this.actor.system.size.length) updateData["width"] = this.actor.system.size.length;
        if (this.height !== this.actor.system.size.length) updateData["height"] = this.actor.system.size.length;
      }
    }
    if (Object.keys(updateData).length > 0 && this.id) await this.update(updateData, updateOptions);
  }

  /**
   * Ensures that vision is correctly set when the token is first created.
   * Configures vision modes and detection ranges based on the {@link TeriockActor}'s senses.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.hasStatusEffect("ethereal") && this.actor.getSetting("token.autoLighting")) {
      const lightRange = Math.max(this.light.bright, this.light.dim);
      foundry.utils.setProperty(this, "detectionModes.spectral.enabled", true);
      foundry.utils.setProperty(this, "detectionModes.spectral.range", lightRange);
      this.sight.range = lightRange;
      this.sight.angle = this.light.angle;
      this.light.bright = 0;
      this.light.dim = 0;
    }
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    if (this.isLazyDelta) return;
    super.prepareEmbeddedDocuments();
    this.applyActiveEffects(TERIOCK.config.change.defaultPhase);
  }
}
