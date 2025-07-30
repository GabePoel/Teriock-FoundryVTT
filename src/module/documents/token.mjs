import { BaseTeriockToken } from "./_base.mjs";
import { characterOptions } from "../helpers/constants/character-options.mjs";
import { convertUnits } from "../helpers/utils.mjs";

export default class TeriockToken extends BaseTeriockToken {
  /**
   * Ensures that vision is correctly set when the token is first created.
   * Configures vision modes and detection ranges based on the {@link TeriockActor}'s senses.
   *
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this._derivedDetectionModes();
    this._deriveVision();
  }

  /** @inheritDoc */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
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
          return { id: id, enabled: true, range: Infinity };
        }),
    );
    this.detectionModes.push(
      ...disabledIds
        .filter((id) => !this.detectionModes.find((mode) => mode.id === id))
        .map((id) => {
          return { id: id, enabled: false, range: 0 };
        }),
    );
  }

  /**
   * Derive vision from the {@link TeriockActor}.
   *
   * @returns {{visionMode: string, range: null|number}}
   */
  _deriveVision() {
    let visionMode = "basic";
    let range = null;

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
      if (this.actor?.statuses?.has("ethereal")) {
        visionMode = "ethereal";
      }
      if (
        this.actor?.statuses?.has("ethereal") &&
        this.actor?.statuses?.has("invisible")
      ) {
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
      this.sight.range = Infinity;
      if (!["down", "dead", "invisibleEthereal"].includes(visionMode)) {
        this.sight.color = "";
      }
    }
    return { visionMode, range };
  }

  /**
   * Derive the detection modes from the {@link TeriockActor}.
   */
  _derivedDetectionModes() {
    if (this.actor) {
      for (const [sense, id] of Object.entries(characterOptions.senseMap)) {
        const mode = this.detectionModes.find((m) => m.id === id);
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
   * @inheritDoc
   * @param {object|object[]} [update]
   * @param {Partial<DatabaseOperation>} [operation]
   */
  _onRelatedUpdate(update = {}, operation = {}) {
    this._derivedDetectionModes();
    this._deriveVision();
    super._onRelatedUpdate(update, operation);
    canvas.perception.initialize();
  }
}
