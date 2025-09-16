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
 * @property {Token} token
 * @property {boolean} isOwner
 */
export default class TeriockTokenDocument extends ChangeableDocumentMixin(TokenDocument) {
  /** @inheritDoc */
  changesField = "tokenChanges";

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
    this.deriveTint();
    super._onRelatedUpdate(update, operation);
    canvas.perception.initialize();
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
    this.detectionModes.push(...enabledIds
      .filter((id) => !this.detectionModes.find((mode) => mode.id === id))
      .map((id) => {
        return {
          id: id,
          enabled: true,
          range: Infinity,
        };
      }));
    this.detectionModes.push(...disabledIds
      .filter((id) => !this.detectionModes.find((mode) => mode.id === id))
      .map((id) => {
        return {
          id: id,
          enabled: false,
          range: 0,
        };
      }));
  }

  /**
   * Do not emit light if Ethereal.
   */
  deriveLighting() {
    if (this.hasStatusEffect("ethereal")) {
      this.light.dim = 0;
      this.light.bright = 0;
    } else if (this.actor) {
      for (const [ key, value ] of Object.entries(this.actor.system.light)) {
        foundry.utils.setProperty(this.light, key, value);
      }
    }
  }

  /**
   * Change token tint if down or dead.
   */
  deriveTint() {
    if (this.hasStatusEffect("down")) {
      this.texture.tint = "#ff0000";
    } else {
      this.texture.tint = "#ffffff";
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
      if (this.actor?.system.senses.night > 0 && this.actor?.system.senses.night >= this.actor?.system.senses.dark) {
        visionMode = "lightAmplification";
      }
      if (this.actor?.statuses?.has("ethereal")) {
        visionMode = "ethereal";
      }
      if (this.actor?.statuses?.has("ethereal") && this.actor?.statuses?.has("invisible")) {
        visionMode = "invisibleEthereal";
      }

      if (this.actor?.statuses?.has("down")) {
        visionMode = "down";
      }
      if (this.actor?.statuses?.has("dead")) {
        visionMode = "dead";
      }

      range = Math.max(
        this.actor?.system.senses.dark,
        this.actor?.system.senses.night,
        this.actor?.system.senses.blind,
        this.actor?.system.senses.hearing,
      );

      this.sight.visionMode = visionMode;
      if (![
        "down",
        "dead",
        "invisibleEthereal",
      ].includes(visionMode)) {
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
      for (const [ sense, id ] of Object.entries(TERIOCK.options.character.senseMap)) {
        const mode = this.detectionModes.find((m) => m.id === id);
        if (mode) {
          mode.range = convertUnits(this.actor.system.senses[sense], "ft", this.parent?.grid.units || "");
          mode.enabled = this.actor.system.senses[sense] > 0;
        }
      }
    }
  }

  /**
   * Ensures that vision is correctly set when the token is first created.
   * Configures vision modes and detection ranges based on the {@link TeriockActor}'s senses.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.derivedDetectionModes();
    this.deriveVision();
    this.deriveLighting();
    this.deriveTint();
  }
}
