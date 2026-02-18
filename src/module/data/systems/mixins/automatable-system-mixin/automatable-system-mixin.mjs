import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/_module.mjs";

/**
 * @param {typeof BaseSystem} Base
 */
export default function AutomatableSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseSystem}
     * @implements {Teriock.Models.AutomatableSystemInterface}
     * @mixin
     */
    class AutomatableSystem extends Base {
      /**
       * Array of the types of automations that this document can have.
       * @returns {(typeof BaseAutomation)[]}
       */
      static get _automationTypes() {
        return [];
      }

      /**
       * The types of automations that this document can have.
       * @returns {Record<string, BaseAutomation>}
       */
      static get automationTypes() {
        return Object.fromEntries(
          this._automationTypes
            .map((a) => [a.TYPE, a])
            .sort((a, b) => a[1].LABEL.localeCompare(b[1].LABEL)),
        );
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          automations: new PseudoCollectionField(BaseAutomation, {
            types: this.automationTypes,
          }),
        });
      }
    }
  );
}
