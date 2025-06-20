const { TokenDocument } = foundry.documents;

export default class TeriockToken extends TokenDocument {
  /**
   * Ensure that vision is correctly set when the token is first created.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    const actor = this.actor;
    this.sight.visionMode = actor?.statuses?.has("ethereal") ? "ethereal" : "basic";
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
  }
}
