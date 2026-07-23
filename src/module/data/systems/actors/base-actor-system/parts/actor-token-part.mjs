import { TeriockActor } from "../../../../../documents/_module.mjs";

/**
 * Actor data model that handles automatically derived token changes.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorTokenPart(Base) {
  return (
    /**
     * @extends {AbstractActorSystem}
     * @mixin
     */
    class ActorTokenPart extends Base {
      /** @type {ActiveEffectData[]} */
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
            phase: TERIOCK.config.change.tokenPhase,
            priority: 5,
            type: "override",
            value: "#ff0000",
          });
        }
      }

      /**
       * Prepare token detection mode changes.
       */
      _prepareTokenDetectionModes() {
        if (!this.actor.system.settings.getSetting("autoDetectionModes")) { return; }
        for (const [sense, config] of Object.entries(TERIOCK.config.character.sense)) {
          if (config?.detectionMode) {
            this._tokenChanges.push({
              key: `detectionModes.${config.detectionMode}.range`,
              phase: TERIOCK.config.change.tokenPhase,
              priority: 5,
              type: "override",
              value: this.senses[sense],
            });
            this._tokenChanges.push({
              key: `detectionModes.${config.detectionMode}.enabled`,
              phase: TERIOCK.config.change.tokenPhase,
              priority: 5,
              type: "override",
              value: this.senses[sense] > 0,
            });
          }
        }
      }

      /**
       * Prepare token vision changes.
       */
      _prepareTokenVision() {
        const angle = 360;
        let maxRange = 0;
        let sightColor;
        let visionMode = "basic";
        for (const [k, v] of Object.entries(this.senses)) {
          const senseVisionMode = TERIOCK.config.character.sense[k]?.visionMode;
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
        const range = Math.max(
          ...Object.entries(this.senses).filter(([k, _v]) => TERIOCK.config.character.sense[k]?.grantsSight).map((
            [_k, v],
          ) => v),
        );
        if (this.actor.system.settings.getSetting("autoVisionModes")) {
          this._tokenChanges.push({
            key: "sight.visionMode",
            phase: TERIOCK.config.change.tokenPhase,
            priority: 5,
            type: "override",
            value: visionMode,
          });
        }
        if (this.actor.system.settings.getSetting("autoVisionRange")) {
          this._tokenChanges.push({
            key: "sight.range",
            phase: TERIOCK.config.change.tokenPhase,
            priority: 5,
            type: "override",
            value: range,
          });
        }
        if (this.actor.system.settings.getSetting("autoVisionAngle")) {
          this._tokenChanges.push({
            key: "sight.angle",
            phase: TERIOCK.config.change.tokenPhase,
            priority: 5,
            type: "override",
            value: angle,
          });
        }
        if (sightColor && this.actor.system.settings.getSetting("autoVisionModes")) {
          this._tokenChanges.push({
            key: "sight.color",
            phase: TERIOCK.config.change.tokenPhase,
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

        const tokenUpdates = foundry.utils.getProperty(changes, "prototypeToken") || {};
        if (foundry.utils.hasProperty(changes, "system.size.value")) {
          const tokenSize = TeriockActor.getSizeConfig(foundry.utils.getProperty(changes, "system.size.value")).length;
          if (!foundry.utils.hasProperty(changes, "prototypeToken.width")) {
            tokenUpdates.width = tokenSize;
            tokenUpdates.height = tokenSize;
            foundry.utils.setProperty(changes, "prototypeToken", tokenUpdates);
          }
          for (const token of this.parent.getDependentTokens()) {
            if (token.parent?.grid?.type === 0) { await token.resize({ height: tokenSize, width: tokenSize }); }
          }
        }
        if (Object.keys(tokenUpdates).length > 0) {
          await Promise.all(
            this.parent.getDependentTokens().filter(t => t.id).map(t =>
              t.update(foundry.utils.deepClone(tokenUpdates))
            ),
          );
        }
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this._tokenChanges = [];
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this._prepareTokenDetectionModes();
      }

      /** @inheritDoc */
      prepareVirtualEffects() {
        super.prepareVirtualEffects();
        this._prepareTokenColor();
        this._prepareTokenVision();
        this.actor.tokenActiveEffectChanges.initial.push(...this._tokenChanges);
      }
    }
  );
}
