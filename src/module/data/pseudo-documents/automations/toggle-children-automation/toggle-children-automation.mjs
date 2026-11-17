import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import {
  getEnsureChildrenOperations,
  getEnsureNoChildrenOperations,
  mergeMetadata,
} from "../../../../utils/_module.mjs";
import { IdentifierSetField } from "../../../fields/_module.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class ToggleChildrenAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ToggleChildren"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { species: true }, type: "toggleChildren" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      add: new IdentifierSetField(),
      qualifier: qualifierField(),
      remove: new IdentifierSetField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["add", "remove", "qualifier"];
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "remove") {
      inputConfig.suggestions = this.getNearestDocument()?.previewed.getNames({ filter: d => !d.system?.isBasic });
    }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /** @inheritDoc */
  async _onUpdateDocument() {
    await super._onUpdateDocument();
    if (!this.active || !this.getNearestDocument()) { return; }
    if (!BaseRoll.qualify(this.qualifier, () => this.getRollData())) { return; }
    const document = this.getNearestDocument();
    await foundry.documents.modifyBatch([
      ...(await getEnsureChildrenOperations(document, Array.from(this.add))),
      ...(await getEnsureNoChildrenOperations(document, Array.from(this.remove))),
    ]);
  }
}
