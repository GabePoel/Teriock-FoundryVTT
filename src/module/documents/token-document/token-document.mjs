//noinspection JSValidateJSDoc

import { TokenSettingsModel } from "../../data/models/settings-models/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { convertUnits } from "../../helpers/unit.mjs";
import { makeIcon, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TokenDocument } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link TokenDocument} implementation.
 * @extends {TokenDocument}
 * @extends {ClientDocument}
 * @mixes EmbedCardDocument
 * @mixes BaseDocument
 * @mixes SettingsDocument
 * @property {TeriockDocumentSheet} sheet
 */
export default class TeriockTokenDocument extends mix(
  TokenDocument,
  mixins.BaseDocumentMixin,
  mixins.EmbedCardDocumentMixin,
  mixins.SettingsDocumentMixin,
) {
  /**
   * Convert the image path to one intended for token rings if possible.
   * @param {string} path
   * @returns {string}
   */
  static ringImage(path) {
    if (path.startsWith(systemPath("icons/creatures"))) {
      return path.replace(
        systemPath("icons/creatures"),
        systemPath("icons/tokens"),
      );
    }
    return path;
  }

  /** @inheritDoc */
  get _settingsFlagsDataModel() {
    return TokenSettingsModel;
  }

  //noinspection JSUnusedGlobalSymbols
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

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.img = this.getSetting("autoTransformation")
      ? this.imageLive
      : this.texture.src;
    if (this.actor) {
      if (this.actor.nameString !== parts.title) {
        parts.text = this.actor.nameString;
      }
    }
    return parts;
  }

  /**
   * The image that should be used to represent this token.
   * @returns {string}
   */
  get imageLive() {
    if (this.isTransformed) {
      return this.imageTransformed;
    } else {
      return this.imageRaw;
    }
  }

  /**
   * The image that should represent this token if it's not transformed.
   * @returns {string}
   */
  get imageRaw() {
    return this.getFlag("teriock", "imageRaw") || this.texture.src;
  }

  /**
   * The image that should represent this token if it is transformed.
   * @returns {string}
   */
  get imageTransformed() {
    let path = this.actor?.system.transformation.image || this.texture.src;
    if (this.ring.enabled) {
      return TeriockTokenDocument.ringImage(path);
    }
    return path;
  }

  /**
   * Whether the token is transformed.
   * @returns {boolean}
   */
  get isTransformed() {
    if (this.actor) {
      return this.actor.system.isTransformed;
    } else {
      return false;
    }
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
  _inferRingSubjectTexture() {
    let out = super._inferRingSubjectTexture();
    if (this.isTransformed && this.actor) {
      out = this.imageTransformed;
    }
    return out;
  }

  /**
   * @inheritDoc
   */
  _onRelatedUpdate(update = {}, operation = {}) {
    this.deriveVision();
    this.deriveLighting();
    this.deriveDetectionModes();
    super._onRelatedUpdate(update, operation);
    this.object?.initializeSources();
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (foundry.utils.hasProperty(data, "texture.src")) {
      this.updateSource({
        flags: {
          teriock: {
            imageRaw: foundry.utils.getProperty(data, "texture.src"),
          },
        },
      });
    }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) {
      return false;
    }
    if (foundry.utils.hasProperty(changes, "texture.src")) {
      if (!options.transformationUpdate) {
        foundry.utils.setProperty(
          changes,
          "flags.teriock.imageRaw",
          foundry.utils.getProperty(changes, "texture.src"),
        );
      }
    }
    foundry.utils.deleteProperty(changes, "flags.teriock.isTransformed");
  }

  /** @inheritDoc */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
    if (!this.getSetting("autoDetectionModes")) return;
    const basicMode = this.detectionModes.find((m) => m.id === "basicSight");
    if (basicMode) {
      basicMode.enabled = false;
    }
    const enabledIds = ["lightPerception"];
    const disabledIds = [
      "blindFighting",
      "darkVision",
      "etherealLight",
      "nightVision",
      "scentPerception",
      "seeEthereal",
      "seeInvisible",
      "soundPerception",
      "trueSight",
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
   * Derive the detection modes from the {@link TeriockActor}.
   */
  deriveDetectionModes() {
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
   * @returns {{visionMode: string, range: null|number, angle: number}}
   */
  deriveVision() {
    let visionMode = "basic";
    let range = 0;
    let angle = 360;
    if (
      this.sight?.enabled &&
      game.settings.get("teriock", "automaticallyChangeVisionModes")
    ) {
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
        angle = this.actor?.system.light.angle || angle;
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
        this.actor?.system.senses.etherealLight,
      );
      if (
        this.getSetting("autoVisionModes") &&
        !["down", "dead", "invisibleEthereal"].includes(visionMode)
      ) {
        this.sight.color = "";
      }
    }
    return {
      visionMode,
      range,
      angle,
    };
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: "Open Actor",
        icon: makeIcon(TERIOCK.options.document.character.icon, "contextMenu"),
        condition: () => this.actor && this.actor.isViewer,
        callback: async () => this.actor.sheet.render(true),
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
    if (this.getSetting("autoColoration")) {
      const tint = this.hasStatusEffect("down") ? "#ff0000" : "#ffffff";
      if (this.texture.tint.css !== tint) {
        updateData["texture.tint"] = tint;
      }
    }
    const { visionMode, range, angle } = this.deriveVision();
    if (this.getSetting("autoVisionRange")) {
      if (this.sight.range !== range) {
        updateData["sight.range"] = range;
      }
    }
    if (this.getSetting("autoVisionAngle")) {
      if (this.sight.angle !== angle) {
        updateData["sight.angle"] = angle;
      }
    }
    if (this.actor) {
      if (this.getSetting("autoScale")) {
        if (this.width !== this.actor.system.size.length) {
          updateData["width"] = this.actor.system.size.length;
        }
        if (this.height !== this.actor.system.size.length) {
          updateData["height"] = this.actor.system.size.length;
        }
      }
      if (this.getSetting("autoTransformation")) {
        if (this.isTransformed) {
          updateOptions["transformationUpdate"] = true;
        }
        if (this.imageLive !== this.texture.src) {
          updateData["texture.src"] = this.imageLive;
        }
      }
    }
    if (Object.keys(updateData).length > 0 && this.id) {
      await this.update(updateData, updateOptions);
    }
    if (
      visionMode !== this.sight.visionMode &&
      game.settings.get("teriock", "automaticallyChangeVisionModes") &&
      this.id &&
      this.getSetting("autoVisionModes")
    ) {
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
    this.deriveVision();
    if (this.getSetting("autoLighting")) this.deriveLighting();
    if (this.getSetting("autoDetectionModes")) this.deriveDetectionModes();
  }
}
