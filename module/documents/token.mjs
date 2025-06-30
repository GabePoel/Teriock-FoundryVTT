const { TokenDocument } = foundry.documents;

export default class TeriockToken extends TokenDocument {
  /**
   * Ensure that vision is correctly set when the token is first created.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    const actor = this.actor;

    if (this.sight?.enabled) {

      let visionMode = "basic";

      if (actor?.system.senses.dark > 0) {
        visionMode = "darkvision";
      }
      if (actor?.system.senses.night > 0 && actor?.system.senses.night >= actor?.system.senses.dark) {
        visionMode = "lightAmplification";
      }
      if (actor?.system.senses.blind + actor?.system.senses.hearing + actor?.system.senses.smell > 0) {
        const maxTremor = Math.max(
          actor?.system.senses.blind,
          actor?.system.senses.hearing,
          actor?.system.senses.smell,
        );
        const maxDark = Math.max(
          actor?.system.senses.dark,
          actor?.system.senses.night,
        );
        if (maxTremor > maxDark) {
          visionMode = "tremorsense";
        }
      }
      if (actor?.statuses?.has("ethereal")) {
        visionMode = "ethereal";
      }
      if (actor?.statuses?.has("ethereal") && actor?.statuses?.has("invisible")) {
        visionMode = "invisibleEthereal";
      }

      this.sight.visionMode = visionMode;
      this.sight.range = Math.max(
        actor?.system.senses.dark,
        actor?.system.senses.night,
        actor?.system.senses.blind,
        actor?.system.senses.hearing,
      );

      if (actor?.system.senses.ethereal > 0) {
        this.detectionModes.find((m) => m.id === "materialEthereal").enabled = true;
        this.detectionModes.find((m) => m.id === "materialEthereal").range = actor?.system.senses.ethereal;
      } else {
        this.detectionModes.find((m) => m.id === "materialEthereal").enabled = false;
        this.detectionModes.find((m) => m.id === "materialEthereal").range = 0;
      }
      if (actor?.system.senses.smell > 0) {
        this.detectionModes.find((m) => m.id === "scentPerception").enabled = true;
        this.detectionModes.find((m) => m.id === "scentPerception").range = actor?.system.senses.smell;
      } else {
        this.detectionModes.find((m) => m.id === "scentPerception").enabled = false;
        this.detectionModes.find((m) => m.id === "scentPerception").range = 0;
      }
      if (actor?.system.senses.hearing > 0) {
        this.detectionModes.find((m) => m.id === "soundPerception").enabled = true;
        this.detectionModes.find((m) => m.id === "soundPerception").range = actor?.system.senses.hearing;
      } else {
        this.detectionModes.find((m) => m.id === "soundPerception").enabled = false;
        this.detectionModes.find((m) => m.id === "soundPerception").range = 0;
      }
      if (actor?.system.senses.blind > 0) {
        this.detectionModes.find((m) => m.id === "blindFighting").enabled = true;
        this.detectionModes.find((m) => m.id === "blindFighting").range = actor?.system.senses.blind;
      } else {
        this.detectionModes.find((m) => m.id === "blindFighting").enabled = false;
        this.detectionModes.find((m) => m.id === "blindFighting").range = 0;
      }
      if (actor?.system.senses.truth > 0) {
        this.detectionModes.find((m) => m.id === "trueSight").enabled = true;
        this.detectionModes.find((m) => m.id === "trueSight").range = actor?.system.senses.truth;
      } else {
        this.detectionModes.find((m) => m.id === "trueSight").enabled = false;
        this.detectionModes.find((m) => m.id === "trueSight").range = 0;
      }
      if (actor?.system.senses.invisible > 0) {
        this.detectionModes.find((m) => m.id === "seeInvisible").enabled = true;
        this.detectionModes.find((m) => m.id === "seeInvisible").range = actor?.system.senses.invisible;
      } else {
        this.detectionModes.find((m) => m.id === "seeInvisible").enabled = false;
        this.detectionModes.find((m) => m.id === "seeInvisible").range = 0;
      }
      if (actor?.system.senses.night + actor?.system.senses.dark > 0) {
        this.detectionModes.find((m) => m.id === "darkVision").enabled = true;
        this.detectionModes.find((m) => m.id === "darkVision").range = Math.max(actor?.system.senses.night, actor?.system.senses.dark);
      } else {
        this.detectionModes.find((m) => m.id === "darkVision").enabled = false;
        this.detectionModes.find((m) => m.id === "darkVision").range = 0;
      }
    }
  }

  /**
   * Ensure that Teriock specific detection modes are added to the token.
   * @inheritdoc
   */
  _prepareDetectionModes() {
    super._prepareDetectionModes();
    if (!this.sight.enabled) return;
    const materialMaterialMode = this.detectionModes.find((m) => m.id === "materialMaterial");
    if (!materialMaterialMode) {
      this.detectionModes.push({
        id: "materialMaterial",
        enabled: true,
        range: Infinity,
      });
    }
    const etherealMaterialMode = this.detectionModes.find((m) => m.id === "etherealMaterial");
    if (!etherealMaterialMode) {
      this.detectionModes.push({
        id: "etherealMaterial",
        enabled: true,
        range: Infinity,
      });
    }
    const etherealEtherealMode = this.detectionModes.find((m) => m.id === "etherealEthereal");
    if (!etherealEtherealMode) {
      this.detectionModes.push({
        id: "etherealEthereal",
        enabled: true,
        range: Infinity,
      });
    }
    const materialEtherealMode = this.detectionModes.find((m) => m.id === "materialEthereal");
    if (!materialEtherealMode) {
      this.detectionModes.push({
        id: "materialEthereal",
        enabled: false,
        range: 0,
      });
    }
    const scentPerceptionMode = this.detectionModes.find((m) => m.id === "scentPerception");
    if (!scentPerceptionMode) {
      this.detectionModes.push({
        id: "scentPerception",
        enabled: false,
        range: 0,
      });
    }
    const soundPerceptionMode = this.detectionModes.find((m) => m.id === "soundPerception");
    if (!soundPerceptionMode) {
      this.detectionModes.push({
        id: "soundPerception",
        enabled: false,
        range: 0,
      });
    }
    const trueSightMode = this.detectionModes.find((m) => m.id === "trueSight");
    if (!trueSightMode) {
      this.detectionModes.push({
        id: "trueSight",
        enabled: false,
        range: 0,
      });
    }
    const seeInvisibleMode = this.detectionModes.find((m) => m.id === "seeInvisible");
    if (!seeInvisibleMode) {
      this.detectionModes.push({
        id: "seeInvisible",
        enabled: false,
        range: 0,
      });
    }
    const blindFightingMode = this.detectionModes.find((m) => m.id === "blindFighting");
    if (!blindFightingMode) {
      this.detectionModes.push({
        id: "blindFighting",
        enabled: false,
        range: 0,
      });
    }
    const darkVisionMode = this.detectionModes.find((m) => m.id === "darkVision");
    if (!darkVisionMode) {
      this.detectionModes.push({
        id: "darkVision",
        enabled: false,
        range: 0,
      });
    }
  }
}
