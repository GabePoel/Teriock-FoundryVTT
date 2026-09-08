import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { ensureChildren, ensureNoChildren } from "../../../../helpers/resolve.mjs";
import { TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

/**
 * @mixes CritMechanic
 */
export default class ToggleChildrenAutomation extends mixClasses(BaseAutomation, CritMechanicMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ToggleChildren"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "toggleChildren" });
  }

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
  async _onFireTrigger(trigger, scope) {
    await super._onFireTrigger(trigger, scope);
    if (trigger !== "updateDocument" || !this.active || !this.document) { return; }
    if (!BaseRoll.qualify(this.qualifier, () => this.getRollData())) { return; }
    await ensureChildren(this.document, Array.from(this.add));
    await ensureNoChildren(this.document, Array.from(this.remove));
  }
}
