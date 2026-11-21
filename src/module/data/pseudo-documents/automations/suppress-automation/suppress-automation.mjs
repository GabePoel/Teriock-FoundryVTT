import { mergeMetadata } from "../../../../utils/_module.mjs";
import { SuppressionModel } from "../../../models/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class SuppressAutomation extends BaseAutomation {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { passive: true }, type: "suppress" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { suppression: new fields.EmbeddedDataField(SuppressionModel) });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    foundry.abstract.Document._addDataFieldMigration(
      source,
      "identifier",
      "suppression.identifiers",
      d => (d.identifier ? [d.identifier] : []),
    );
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _formPaths() {
    return this.suppression._formPaths.map(p => `suppression.${p}`);
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "suppression.identifiers") {
      inputConfig.suggestions = this.actor?.previewed.getNames({ filter: d => !d.system?.isBasic });
    }
    if (path === "suppression.qualifier") { inputConfig.context = "child"; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }
}
