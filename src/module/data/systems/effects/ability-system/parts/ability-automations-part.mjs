/**
 * Ability automations part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @mixin
     */
    class AbilityAutomationsPart extends Base {
      /**
       * The automations that are active right now.
       * @returns {BaseAutomation[]}
       */
      get activeAutomations() {
        if (this.maneuver !== "passive") return [];
        return super.activeAutomations;
      }
    }
  );
};
