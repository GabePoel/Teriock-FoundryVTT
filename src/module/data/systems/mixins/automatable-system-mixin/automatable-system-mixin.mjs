import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/abstract/_module.mjs";

/** Selection sources that mean a region carries documents to apply. */
const SELECTION_SOURCES = ["globalIdentifiers", "globalUuids", "localIdentifiers", "localQualifier", "localUuids"];

const RENAMED_AUTOMATION_TYPES = {
  abilityMacro: "macro",
  chatMacro: "macro",
  chatStatus: "status",
  commonMacro: "macro",
  propertyMacro: "macro",
};

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AutomatableSystem & Teriock.Models.AutomatableSystemData>}
 */
export default function AutomatableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.AutomatableSystemData}
   * @mixin
   */
  class AutomatableSystem extends Base {
    /**
     * Array of the types of automations that this system can have.
     * @returns {(typeof Automation)[]}
     */
    static get _automationTypes() {
      return [];
    }

    /**
     * The types of automations that this system can have.
     * @returns {Record<string, Automation>}
     */
    static get automationTypes() {
      return Object.fromEntries(
        this._automationTypes.map(a => [a.metadata.type, a]).sort((a, b) =>
          _loc(a[1].typeLabel).localeCompare(_loc(b[1].typeLabel))
        ),
      );
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Automation: "system.automations" } });
    }

    /**
     * Migrate the source data for a single Automation.
     * @param {object} automation
     */
    static _migrateAutomationData(automation) {
      this._migrateAutomationRegionData(automation);
      const renamed = RENAMED_AUTOMATION_TYPES[automation?.type];
      if (renamed) { automation.type = renamed; }
    }

    /**
     * Convert a targeting RegionAutomation into a TargetAutomation.
     * @param {object} automation
     */
    static _migrateAutomationRegionData(automation) {
      const isTargeting = automation?.type === "region"
        && automation.trigger === "executeInput"
        && automation.targeting !== false
        && !automation.overrideData
        && !SELECTION_SOURCES.some(k => automation[k]?.length)
        && this._automationTypes.some(a => a.metadata.type === "target");
      if (isTargeting) { automation.type = "target"; }
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        automations: new PseudoCollectionField(BaseAutomation, { types: this.automationTypes }),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      for (const automation of Object.values(source.automations ?? {})) { this._migrateAutomationData(automation); }
      return super.migrateData(source, options);
    }
  }

  return AutomatableSystem;
}
