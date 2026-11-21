import { qualifierField } from "../../data/fields/tools/builders.mjs";

const { RegionBehaviorConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockRegionBehaviorConfig extends RegionBehaviorConfig {
  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const field = qualifierField({
      hint: _loc("TERIOCK.SCHEMA.BehaviorQualifier.hint"),
      initial: "1",
      label: _loc("TERIOCK.SCHEMA.BehaviorQualifier.label"),
      placeholder: "1",
    });
    result.form?.querySelector(".form-group:has([name='disabled'])")?.after(
      field.toFormGroup({ rootId: this.id }, {
        name: "flags.teriock.qualifier",
        rootId: this.id,
        value: this.document.getFlag("teriock", "qualifier"),
      }),
    );
    super._replaceHTML(result, content, options);
  }
}
