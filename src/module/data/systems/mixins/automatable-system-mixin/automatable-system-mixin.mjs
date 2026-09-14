import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
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
 * Automation types with a given metadata tag.
 * @param {string} tag
 * @returns {(typeof Automation)[]}
 */
function getTaggedAutomationTypes(tag) {
  return Object.values(automations).filter(a => foundry.utils.isSubclass(a, BaseAutomation) && a.metadata.tags[tag]);
}

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
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { pseudos: { Automation: "system.automations" } });

    /**
     * Automation types that make activations.
     * @returns {(typeof Automation)[]}
     */
    static get _activationAutomationTypes() {
      return getTaggedAutomationTypes("triggered");
    }

    /**
     * Array of the types of automations that this system can have.
     * @returns {(typeof Automation)[]}
     */
    static get _automationTypes() {
      return [];
    }

    /**
     * Automation types that apply while their document is active.
     * @returns {(typeof Automation)[]}
     */
    static get _passiveAutomationTypes() {
      return getTaggedAutomationTypes("passive");
    }

    /**
     * The types of automations that this system can have.
     * @returns {Record<string, Automation>}
     */
    static get automationTypes() {
      const allowed = this._automationTypes.filter(a =>
        Object.entries(a.metadata.requires).every(([k, v]) => this.metadata.tags[k] === v)
      );
      return Object.fromEntries(
        allowed.map(a => [a.metadata.type, a]).sort((a, b) => _loc(a[1].typeLabel).localeCompare(_loc(b[1].typeLabel))),
      );
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
