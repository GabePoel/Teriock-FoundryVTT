import { AbilityMacroAutomation } from "../../../../pseudo-documents/automations/_module.mjs";

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

      /** @inheritDoc */
      get pseudoHookChanges() {
        const macroAutomations =
          /** @type {AbilityMacroAutomation[]} */ this.activeAutomations.filter(
            (a) => a.type === AbilityMacroAutomation.TYPE,
          );
        return macroAutomations
          .filter((a) => a.relation === "pseudoHook")
          .map((a) => {
            return {
              key: `system.hookedMacros.${a.pseudoHook}`,
              mode: 2,
              priority: 5,
              qualifier: "1",
              target: "Actor",
              time: "normal",
              value: a.macro,
            };
          });
      }
    }
  );
};
