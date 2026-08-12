/**
 * Ability automations part.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityAutomationsPart>}
 */
export default function AbilityAutomationsPart(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityAutomationsPart extends Base {
    /**
     * The automations that are active right now.
     * @returns {Automation[]}
     */
    get activeAutomations() {
      if (this.maneuver !== "passive") { return []; }
      return super.activeAutomations;
    }
  }

  return AbilityAutomationsPart;
}
