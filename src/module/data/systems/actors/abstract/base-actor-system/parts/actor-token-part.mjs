/**
 * @import { ActiveEffectData } from "@common/documents/_types.mjs";
 * @import AbstractActorSystem from "../abstract-actor-system.mjs";
 */

/**
 * Actor data model that handles automatically derived token changes.
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorTokenPart(Base) {
  /**
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorTokenPart extends Base {
    /** @type {EffectChangeData[]} */
    _tokenChanges;

    /** @inheritDoc */
    async _preCreate(data, options, user) {
      const yes = await super._preCreate(data, options, user);
      if (yes === false) { return false; }

      this.parent.updateSource(
        foundry.utils.mergeObject({
          prototypeToken: {
            bar1: { attribute: "hp" },
            bar2: { attribute: "mp" },
            displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
            height: this.size.length,
            sight: { enabled: true, range: 0 },
            width: this.size.length,
          },
        }, data),
      );
    }

    /**
     * Prepare token color.
     */
    _prepareTokenColor() {
      if (
        (this.actor.statuses.has("down") || this.actor.statuses.has("dead"))
        && this.actor.system.settings.getSetting("autoColoration")
      ) {
        this._tokenChanges.push({
          key: "texture.tint",
          phase: TERIOCK.CONFIG.change.tokenPhase,
          priority: 5,
          type: "override",
          value: "#ff0000",
        });
      }
    }

    /**
     * Prepare token vision changes.
     * @category Perception
     */
    _prepareTokenVision() {
      const angle = 360;
      let maxRange = 0;
      let sightColor;
      let visionMode = "basic";
      for (const [k, v] of Object.entries(this.senses)) {
        const senseVisionMode = TERIOCK.CONFIG.character.sense[k]?.visionMode;
        if (senseVisionMode && v > maxRange) {
          maxRange = v;
          visionMode = senseVisionMode;
        }
      }
      if (this.actor.statuses.has("ethereal")) {
        visionMode = "ethereal";
        if (this.actor.statuses.has("invisible")) { visionMode = "invisibleEthereal"; }
      }
      if (this.actor.statuses.has("down")) {
        sightColor = "#a36767";
        visionMode = "down";
      }
      if (this.actor.statuses.has("dead")) {
        sightColor = "#ff0000";
        visionMode = "dead";
      }
      if (this.actor.system.settings.getSetting("autoVisionModes")) {
        this._tokenChanges.push({
          key: "sight.visionMode",
          phase: TERIOCK.CONFIG.change.tokenPhase,
          priority: 5,
          type: "override",
          value: visionMode,
        });
      }
      if (this.actor.system.settings.getSetting("autoVisionAngle")) {
        this._tokenChanges.push({
          key: "sight.angle",
          phase: TERIOCK.CONFIG.change.tokenPhase,
          priority: 5,
          type: "override",
          value: angle,
        });
      }
      if (sightColor && this.actor.system.settings.getSetting("autoVisionModes")) {
        this._tokenChanges.push({
          key: "sight.color",
          phase: TERIOCK.CONFIG.change.tokenPhase,
          priority: 5,
          type: "override",
          value: sightColor,
        });
      }
    }

    /** @inheritDoc */
    async _preUpdate(changes, options, user) {
      const yes = await super._preUpdate(changes, options, user);
      if (yes === false) { return false; }

      if (
        foundry.utils.hasProperty(changes, "system.size.value")
        && !foundry.utils.hasProperty(changes, "prototypeToken.width")
      ) {
        const tokenSize =
          this.parent.constructor.getSizeConfig(foundry.utils.getProperty(changes, "system.size.value")).length;
        foundry.utils.mergeObject(changes, { prototypeToken: { height: tokenSize, width: tokenSize } });
      }
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      this._tokenChanges = [];
    }

    /** @inheritDoc */
    prepareVirtualEffects() {
      super.prepareVirtualEffects();
      this._prepareTokenColor();
      this._prepareTokenVision();
      this.actor.tokenActiveEffectChanges.initial.push(...this._tokenChanges);
    }
  }

  return ActorTokenPart;
}
