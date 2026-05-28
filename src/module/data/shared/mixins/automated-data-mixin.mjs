/**
 * Mixin for classes that use automations even if they don't have them in their data model.
 * @param {typeof ChildSystem|EmbeddedDataModel} Base
 */
export default function AutomatedDataMixin(Base) {
  return (
    /**
     * @mixin
     */
    class AutomatedData extends Base {
      /**
       * All the automations that this considers to be currently active.
       * @returns {Teriock.Automations.Any[]}
       */
      get activeAutomations() {
        const automations = this.automations.contents;
        return automations.filter(a => a.active);
      }

      /**
       * Get all the automations of a given type.
       * @template {Teriock.Automations.Type} T
       * @param {T} type
       * @param {object} [options]
       * @param {boolean} [options.active]
       * @returns {Teriock.Automations.TypeMap[T][]}
       */
      getAutomations(type, options = {}) {
        const { active } = options;
        if (active) { return this.activeAutomations.filter(a => a.type === type); }
        return this.automations.contents.filter(a => a.type === type);
      }
    }
  );
}
