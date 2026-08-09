/**
 * Ability automations part.
 * @template {Constructor<BaseEffectSystem>} T
 * @param {T} Base
 */
export default function AbilityAutomationsPart(Base) {
  /**
   * @extends {BaseEffectSystem}
   * @mixin
   * @property {TeriockAbility} parent
   */
  class AbilityAutomationsPart extends Base {
    /**
     * The automations that are active right now.
     * @returns {AnyAutomation[]}
     */
    get activeAutomations() {
      if (this.maneuver !== "passive") { return []; }
      return super.activeAutomations;
    }
  }

  return AbilityAutomationsPart;
}
