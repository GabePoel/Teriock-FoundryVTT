/**
 * Ability automations part.
 * @param {typeof AbilitySystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {AbilitySystem}
     * @mixin
     */
    class AbilityAutomationsPart extends Base {
      /**
       * The automations that are active right now.
       * @returns {Teriock.Automations.Any[]}
       */
      get activeAutomations() {
        if (this.maneuver !== "passive") return [];
        return super.activeAutomations;
      }
    }
  );
};
