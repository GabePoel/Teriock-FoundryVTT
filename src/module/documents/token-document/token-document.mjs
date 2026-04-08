//noinspection JSValidateJSDoc

import { icons } from "../../constants/display/icons.mjs";
import { TokenSettingsModel } from "../../data/models/settings-models/_module.mjs";
import { convertUnits } from "../../helpers/unit.mjs";
import { makeIcon, mix } from "../../helpers/utils.mjs";
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
  mixins.SettingsDocumentMixin,
) {
  /** @inheritDoc */
  get _settingsFlagsDataModel() {
    return TokenSettingsModel;
  }

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
    parts.icon = icons.document.token;
    if (this.actor) {
      if (this.actor.fullName !== parts.title) {
        parts.text = this.actor.fullName;
      }
    }
    return parts;
  }

  /**
   * The image that should be used to represent this token.
   * @returns {string}
   */
  get imageLive() {
    if (this.isTransformed) return this.imageTransformed;
    return this.imageRaw;
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
    if (!this.actor) return this.texture.src;
    return this.actor.system.transformation.img || this.texture.src;
  }

  /**
   * Whether the token is transformed.
   * @returns {boolean}
   */
  get isTransformed() {
    if (this.actor) return this.actor.system.isTransformed;
    return false;
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

  /**
   * Whether this should have a ring.
   * @returns {boolean}
   */
  get ringLive() {
    if (this.isTransformed) return this.ringTransformed;
    return this.ringRaw;
  }

  /**
   * Whether this should have a ring if not transformed.
   * @returns {boolean}
   */
  get ringRaw() {
    return !!(this.getFlag("teriock", "ringRaw") ?? this.ring.enabled);
  }

  /**
   * Whether this should have a ring if transformed.
   * @returns {boolean}
   */
  get ringTransformed() {
    if (this.actor && this.actor.system.transformation.img) {
      return this.actor.system.transformation.ring;
    }
    return this.ringRaw;
  }

  /** @inheritDoc */
  _inferRingSubjectTexture() {
    let out = super._inferRingSubjectTexture();
    if (this.isTransformed && this.actor) out = this.imageTransformed;
    return out;
  }

  /**
   * @inheritDoc
   */
  _onRelatedUpdate(update = {}, operation = {}) {
    if (this.getSetting("autoVisionModes")) this.deriveVision();
    if (this.getSetting("autoLighting")) this.deriveLighting();
    if (this.getSetting("autoDetectionModes")) this.deriveDetectionModes();
    super._onRelatedUpdate(update, operation);
    if (this.object) this.object.initializeSources();
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    this.updateSource(
      foundry.utils.mergeObject(
        {
          flags: {
            teriock: {
              imageRaw: foundry.utils.getProperty(data, "texture.src"),
              ringRaw: foundry.utils.getProperty(data, "ring.enabled"),
            },
          },
        },
        data,
      ),
    );
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) return false;

    if (foundry.utils.hasProperty(changes, "texture.src")) {
      if (!options.transformationUpdate) {
        foundry.utils.setProperty(
          changes,
          "flags.teriock.imageRaw",
          foundry.utils.getProperty(changes, "texture.src"),
        );
        foundry.utils.setProperty(
          changes,
          "flags.teriock.ringRaw",
          foundry.utils.getProperty(changes, "ring.enabled"),
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
    if (basicMode) basicMode.enabled = false;
    const enabledIds = ["lightPerception"];
    const disabledIds = Object.values(TERIOCK.options.character.senseTypes)
      .map((c) => c?.detectionMode)
      .filter((_) => _);
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
    if (!this.actor) return;
    for (const [sense, config] of Object.entries(
      TERIOCK.options.character.senseTypes,
    )) {
      if (config?.detectionMode) {
        const mode = this.detectionModes.find(
          (m) => m.id === config.detectionMode,
        );
        if (!mode) continue;
        mode.range = convertUnits(
          this.actor.system.senses[sense],
          "ft",
          this.parent?.grid.units || "",
        );
        mode.enabled = this.actor.system.senses[sense] > 0;
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
      game.teriock.getSetting("automaticallyChangeVisionModes") &&
      this.actor
    ) {
      let maxRange = 0;
      for (const [k, v] of Object.entries(this.actor.system.senses)) {
        const senseVisionMode =
          TERIOCK.options.character.senseTypes[k]?.visionMode;
        if (senseVisionMode && v > maxRange) {
          maxRange = v;
          visionMode = senseVisionMode;
        }
      }
      if (this.hasStatusEffect("ethereal")) {
        visionMode = "ethereal";
        angle = this.actor.system.light.angle || angle;
      }
      if (
        this.hasStatusEffect("ethereal") &&
        this.hasStatusEffect("invisible")
      ) {
        visionMode = "invisibleEthereal";
      }
      if (this.hasStatusEffect("down")) visionMode = "down";
      if (this.hasStatusEffect("dead")) visionMode = "dead";
      range = Math.max(
        ...Object.entries(this.actor.system.senses)
          .filter(
            ([_k, v]) => TERIOCK.options.character.senseTypes[v]?.grantsSight,
          )
          .map(([_k, v]) => v),
        this.actor.system.senses.spectral,
      );
      if (
        this.getSetting("autoVisionModes") &&
        !["down", "dead", "invisibleEthereal"].includes(visionMode)
      ) {
        this.sight.color = "";
      }
    }
    return { visionMode, range, angle };
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: game.i18n.localize("TERIOCK.SYSTEMS.Common.MENU.openSource"),
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
      if (this.texture.tint.css !== tint) updateData["texture.tint"] = tint;
    }
    const { visionMode, range, angle } = this.deriveVision();
    if (this.getSetting("autoVisionRange")) {
      if (this.sight.range !== range) updateData["sight.range"] = range;
    }
    if (this.getSetting("autoVisionAngle")) {
      if (this.sight.angle !== angle) updateData["sight.angle"] = angle;
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
        if (this.ringLive !== this.ring.enabled) {
          updateData["ring.enabled"] = this.ringLive;
        }
      }
    }
    if (Object.keys(updateData).length > 0 && this.id) {
      await this.update(updateData, updateOptions);
    }
    if (
      visionMode !== this.sight.visionMode &&
      game.teriock.getSetting("automaticallyChangeVisionModes") &&
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
