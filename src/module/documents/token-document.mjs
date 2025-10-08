import { convertUnits } from "../helpers/utils.mjs";
import { ChangeableDocumentMixin } from "./mixins/_module.mjs";

const { TokenDocument } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link TokenDocument} implementation.
 * @extends {TokenDocument}
 * @mixes ChangeableDocumentMixin
 * @mixes ClientDocumentMixin
 * @property {"TokenDocument"} documentName
 * @property {TeriockActor} actor
 * @property {TeriockToken} object
 * @property {boolean} isOwner
 */
export default class TeriockTokenDocument extends ChangeableDocumentMixin(
  TokenDocument,
) {
  /** @inheritDoc */
  changesField = "tokenChanges";

  /**
   * Center of this token.
   * @returns {Point}
   */
  get center() {
    return {
      x: this.x + this.sizeX / 2,
      y: this.y + this.sizeY / 2,
    };
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
   * @returns {number}
   */
  get rescale() {
    return this.ring.enabled;
  }

  /** @inheritDoc */
  _checkPreparation() {
    return this.actor;
  }

  /**
   * @inheritDoc
   */
  _onRelatedUpdate(update = {}, operation = {}) {
    this.derivedDetectionModes();
    this.deriveVision();
    this.deriveLighting();
    super._onRelatedUpdate(update, operation);
    game.canvas.perception.initialize();
  }

  /** @inheritDoc */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
    const basicMode = this.detectionModes.find((m) => m.id === "basicSight");
    if (basicMode) {
      basicMode.enabled = false;
    }
    const enabledIds = [
      "materialMaterial",
      "etherealMaterial",
      "etherealEthereal",
    ];
    const disabledIds = [
      "materialEthereal",
      "scentPerception",
      "soundPerception",
      "trueSight",
      "seeInvisible",
      "blindFighting",
      "darkVision",
    ];
    this.detectionModes.push(
      ...enabledIds
        .filter((id) => !this.detectionModes.find((mode) => mode.id === id))
        .map((id) => {
          return {
            id: id,
            enabled: true,
            range: Infinity,
          };
        }),
    );
    this.detectionModes.push(
      ...disabledIds
        .filter((id) => !this.detectionModes.find((mode) => mode.id === id))
        .map((id) => {
          return {
            id: id,
            enabled: false,
            range: 0,
          };
        }),
    );
  }

  /**
   * Do not emit light if Ethereal.
   */
  deriveLighting() {
    if (this.hasStatusEffect("ethereal")) {
      this.light.dim = 0;
      this.light.bright = 0;
    } else if (this.actor) {
      for (const [key, value] of Object.entries(this.actor.system.light)) {
        foundry.utils.setProperty(this.light, key, value);
      }
    }
  }

  /**
   * Derive vision from the {@link TeriockActor}.
   * @returns {{visionMode: string, range: null|number}}
   */
  deriveVision() {
    let visionMode = "basic";
    let range = 0;

    if (this.sight?.enabled) {
      if (this.actor?.system.senses.dark > 0) {
        visionMode = "darkvision";
      }
      if (
        this.actor?.system.senses.night > 0 &&
        this.actor?.system.senses.night >= this.actor?.system.senses.dark
      ) {
        visionMode = "lightAmplification";
      }
      if (this.hasStatusEffect("ethereal")) {
        visionMode = "ethereal";
      }
      if (
        this.hasStatusEffect("ethereal") &&
        this.hasStatusEffect("invisible")
      ) {
        visionMode = "invisibleEthereal";
      }

      if (this.hasStatusEffect("down")) {
        visionMode = "down";
      }
      if (this.hasStatusEffect("dead")) {
        visionMode = "dead";
      }

      range = Math.max(
        this.actor?.system.senses.dark,
        this.actor?.system.senses.night,
        this.actor?.system.senses.blind,
        this.actor?.system.senses.hearing,
      );

      if (!["down", "dead", "invisibleEthereal"].includes(visionMode)) {
        this.sight.color = "";
      }
    }
    return {
      visionMode,
      range,
    };
  }

  /**
   * Derive the detection modes from the {@link TeriockActor}.
   */
  derivedDetectionModes() {
    if (this.actor) {
      for (const [sense, id] of Object.entries(
        TERIOCK.options.character.senseMap,
      )) {
        const mode = this.detectionModes.find((m) => m.id === id);
        if (mode) {
          mode.range = convertUnits(
            this.actor.system.senses[sense],
            "ft",
            this.parent?.grid.units || "",
          );
          mode.enabled = this.actor.system.senses[sense] > 0;
        }
      }
    }
  }

  /**
   * Perform all updates needed to synchronize this with {@link TeriockActor} data.
   * @returns {Promise<void>}
   */
  async postActorUpdate() {
    const updateData = {};
    const tint = this.hasStatusEffect("down") ? "#ff0000" : "#ffffff";
    if (this.texture.tint.css !== tint) {
      updateData["texture.tint"] = tint;
    }
    const { visionMode, range } = this.deriveVision();
    if (this.sight.range !== range) {
      updateData["sight.range"] = range;
    }
    if (this.actor) {
      const tokenLight = this.light.toObject();
      const actorLight = foundry.utils.deepClone(this.actor.system.light);
      const mergedLight = foundry.utils.mergeObject(tokenLight, actorLight);
      if (!foundry.utils.objectsEqual(tokenLight, mergedLight)) {
        updateData["light"] = mergedLight;
      }
      if (this.width !== this.actor.system.size.length) {
        updateData["width"] = this.actor.system.size.length;
      }
      if (this.height !== this.actor.system.size.length) {
        updateData["height"] = this.actor.system.size.length;
      }
    }
    if (Object.keys(updateData).length > 0) {
      await this.update(updateData);
    }
    if (visionMode !== this.sight.visionMode) {
      await this.updateVisionMode(visionMode);
    }
  }

  /**
   * Ensures that vision is correctly set when the token is first created.
   * Configures vision modes and detection ranges based on the {@link TeriockActor}'s senses.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.deriveLighting();
    this.derivedDetectionModes();
    this.deriveVision();
  }
}
