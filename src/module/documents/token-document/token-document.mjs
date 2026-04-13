//noinspection JSValidateJSDoc

import { icons } from "../../constants/display/icons.mjs";
import { mix } from "../../helpers/construction.mjs";
import { convertUnits } from "../../helpers/unit.mjs";
import { makeIcon } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TokenDocument } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock TokenDocument implementation.
 * @implements {Teriock.Documents.TokenDocumentInterface}
 * @extends {TokenDocument}
 * @extends {ClientDocument}
 * @mixes EmbedCardDocument
 * @mixes BaseDocument
 * @mixes SettingsDocument
 */
export default class TeriockTokenDocument extends mix(
  TokenDocument,
  mixins.BaseDocumentMixin,
  mixins.EmbedCardDocumentMixin,
) {
  /**
   * Center of this token.
   * @returns {Point}
   */
  get center() {
    return { x: this.x + this.sizeX / 2, y: this.y + this.sizeY / 2 };
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = Object.assign(super.embedParts, {
      img: this.imageLive,
      icon: icons.document.token,
    });
    if (this.actor && this.actor.fullName !== parts.title) {
      parts.text = this.actor.fullName;
    }
    return parts;
  }

  /**
   * The image that should be used to represent this token.
   * @returns {string}
   */
  get imageLive() {
    return this.texture.src;
  }

  /**
   * A radius for this token in grid units.
   * @returns {number}
   */
  get radius() {
    return convertUnits(
      Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2)) * 5,
      "ft",
      this.parent?.grid.units || "",
    );
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
    this.detectionModes.lightPerception.enabled = true;
    this.detectionModes.lightPerception.range = Infinity;
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
        icon: makeIcon(TERIOCK.options.document.character.icon, "contextMenu"),
        visible: () => this.actor && this.actor.isViewer,
        onClick: async () => this.actor.sheet.render(true),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
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
        if (this.width !== this.actor.system.size.length) {
          updateData["width"] = this.actor.system.size.length;
        }
        if (this.height !== this.actor.system.size.length) {
          updateData["height"] = this.actor.system.size.length;
        }
      }
    }
    if (Object.keys(updateData).length > 0 && this.id) {
      await this.update(updateData, updateOptions);
    }
  }

  /**
   * Ensures that vision is correctly set when the token is first created.
   * Configures vision modes and detection ranges based on the {@link TeriockActor}'s senses.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.applyActiveEffects("derivation");
    this.applyActiveEffects("completion");
    if (
      this.hasStatusEffect("ethereal") &&
      this.actor.getSetting("token.autoLighting")
    ) {
      const lightRange = Math.max(this.light.bright, this.light.dim);
      foundry.utils.setProperty(this, "detectionModes.spectral.enabled", true);
      foundry.utils.setProperty(
        this,
        "detectionModes.spectral.range",
        lightRange,
      );
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
    this.applyActiveEffects("normal");
    this.applyActiveEffects("proficiency");
    this.applyActiveEffects("fluency");
  }
}
