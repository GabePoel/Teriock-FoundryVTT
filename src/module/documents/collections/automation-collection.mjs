import TypeCollection from "./type-collection.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @extends {TypeCollection<ID<BaseAutomation>, BaseAutomation>}
 * @property {BaseAutomation[]} contents
 */
export default class AutomationCollection extends TypeCollection {
  /**
   * The automations that are considered active.
   * @returns {BaseAutomation[]}
   */
  get active() {
    return this.contents.filter((a) => a.active);
  }
}
