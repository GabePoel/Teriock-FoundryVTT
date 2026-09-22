import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { ensureChildren, ensureNoChildren } from "../../../../helpers/resolve.mjs";
import { TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class ToggleChildrenAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ToggleChildren"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "toggleChildren" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      add: new TypedIdentifierSetField(),
      qualifier: qualifierField(),
      remove: new TypedIdentifierSetField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    delete source.trigger;
    return super.migrateData(source, options);
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
  async _onFireTrigger(trigger, scope) {
    await super._onFireTrigger(trigger, scope);
    if (trigger !== "updateDocument" || !this.active || !this.getNearestDocument()) { return; }
    if (!BaseRoll.qualify(this.qualifier, () => this.getRollData())) { return; }
    await ensureChildren(this.getNearestDocument(), Array.from(this.add));
    await ensureNoChildren(this.getNearestDocument(), Array.from(this.remove));
  }
}
