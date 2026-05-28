/**
 * Ability automations part.
 * @param {typeof BaseEffectSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @mixin
     */
    class AbilityAutomationsPart extends Base {
      /**
       * The automations that are active right now.
       * @returns {Teriock.Automations.Any[]}
       */
      get activeAutomations() {
        if (this.maneuver !== "passive") { return []; }
        return super.activeAutomations;
      }
    }
  );
};
