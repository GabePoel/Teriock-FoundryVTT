import { qualifierField } from "../../data/fields/tools/builders.mjs";

const { RegionBehaviorConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockRegionBehaviorConfig extends RegionBehaviorConfig {
  /** @inheritDoc */
  _getFields() {
    const fieldsets = super._getFields();
    const statusFieldset = fieldsets.find(f => f.legend === "BEHAVIOR.SECTIONS.status");
    if (statusFieldset) {
      const field = qualifierField({
        hint: _loc("TERIOCK.SCHEMA.BehaviorQualifier.hint"),
        initial: "1",
        label: _loc("TERIOCK.SCHEMA.BehaviorQualifier.label"),
        placeholder: "1",
      });
      field.name = "flags.teriock.qualifier";
      statusFieldset.fields.push({ field, value: this.document.getFlag("teriock", "qualifier") });
    }
    return fieldsets;
  }
}
