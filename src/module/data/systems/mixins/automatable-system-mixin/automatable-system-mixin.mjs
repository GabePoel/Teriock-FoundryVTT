import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/abstract/_module.mjs";

/**
 * @template {Constructor<TeriockSystem>} T
 * @param {T} Base
 */
export default function AutomatableSystemMixin(Base) {
  /**
   * @extends {TeriockSystem}
   * @extends {Teriock.Models.AutomatableSystemData}
   * @mixin
   */
  class AutomatableSystem extends Base {
    /**
     * Array of the types of automations that this system can have.
     * @returns {(typeof AnyAutomation)[]}
     */
    static get _automationTypes() {
      return [];
    }

    /**
     * The types of automations that this system can have.
     * @returns {Record<string, AnyAutomation>}
     */
    static get automationTypes() {
      return Object.fromEntries(
        this._automationTypes.map(a => [a.TYPE, a]).sort((a, b) => a[1].LABEL.localeCompare(b[1].LABEL)),
      );
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Automation: "system.automations" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        automations: new PseudoCollectionField(BaseAutomation, { types: this.automationTypes }),
      });
    }
  }

  return AutomatableSystem;
}
