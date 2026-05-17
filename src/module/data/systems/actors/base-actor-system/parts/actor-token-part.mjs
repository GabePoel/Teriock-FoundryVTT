/**
 * Actor data model that handles automatically derived token changes.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {AbstractActorSystem}
     * @mixin
     */
    class ActorTokenPart extends Base {
      /** @type {ActiveEffectData[]} */
      _tokenChanges;

      /**
       * Prepare token color.
       */
      _prepareTokenColor() {
        if (
          (this.actor.statuses.has("down") || this.actor.statuses.has("dead")) &&
          this.actor.getSetting("token.autoColoration")
        ) {
          this._tokenChanges.push({
            key: "texture.tint",
            phase: "initial",
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
        if (!this.actor.getSetting("token.autoDetectionModes")) return;
        for (const [sense, config] of Object.entries(TERIOCK.config.character.sense)) {
          if (config?.detectionMode) {
            this._tokenChanges.push({
              key: `detectionModes.${config.detectionMode}.range`,
              phase: "initial",
              priority: 5,
              type: "override",
              value: this.senses[sense],
            });
            this._tokenChanges.push({
              key: `detectionModes.${config.detectionMode}.enabled`,
              phase: "initial",
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
          if (this.actor.statuses.has("invisible")) {
            visionMode = "invisibleEthereal";
          }
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
          ...Object.entries(this.senses)
            .filter(([k, _v]) => TERIOCK.config.character.sense[k]?.grantsSight)
            .map(([_k, v]) => v),
        );
        if (this.actor.getSetting("token.autoVisionModes")) {
          this._tokenChanges.push({
            key: "sight.visionMode",
            phase: "initial",
            priority: 5,
            type: "override",
            value: visionMode,
          });
        }
        if (this.actor.getSetting("token.autoVisionRange")) {
          this._tokenChanges.push({
            key: "sight.range",
            phase: "initial",
            priority: 5,
            type: "override",
            value: range,
          });
        }
        if (this.actor.getSetting("token.autoVisionAngle")) {
          this._tokenChanges.push({
            key: "sight.angle",
            phase: "initial",
            priority: 5,
            type: "override",
            value: angle,
          });
        }
        if (sightColor && this.actor.getSetting("token.autoVisionModes")) {
          this._tokenChanges.push({
            key: "sight.color",
            phase: "initial",
            priority: 5,
            type: "override",
            value: sightColor,
          });
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
        this.actor.tokenActiveEffectChanges["initial"].push(...this._tokenChanges);
      }
    }
  );
};
