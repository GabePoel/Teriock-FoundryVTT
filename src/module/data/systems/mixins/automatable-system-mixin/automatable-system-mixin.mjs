import { mergeMetadata } from "../../../../utils/_module.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/abstract/_module.mjs";

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AutomatableSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AutomatableSystemData}
   */
  class AutomatableSystem extends /** @type {InitializedDataModel<T, Teriock.Models.AutomatableSystemData>} */ (Base) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, {
      automationTags: {},
      pseudos: { Automation: "system.automations" },
    });

    /**
     * The types of automations that this system can have.
     * @returns {Record<string, Automation>}
     */
    static get automationTypes() {
      const allowed = Object.values(TERIOCK.CONFIG.Automation.dataModels).filter(a =>
        Object.entries(a.metadata.tags).some(([k, v]) => v && this.metadata.automationTags[k])
        && Object.entries(a.metadata.requires).every(([k, v]) => this.metadata.tags[k] === v)
      );
      return Object.fromEntries(
        allowed.map(a => [a.metadata.type, a]).sort((a, b) =>
          _loc(a[1].typeLabel).localeCompare(_loc(b[1].typeLabel), game.i18n.lang)
        ),
      );
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
