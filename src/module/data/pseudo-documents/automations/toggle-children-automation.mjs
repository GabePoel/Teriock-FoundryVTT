import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { ensureChildren, ensureNoChildren } from "../../../helpers/resolve.mjs";
import { TypedIdentifierSetField } from "../../fields/_module.mjs";
import { qualifierField } from "../../fields/tools/builders.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 * @property {Set<TypedIdentifier>} add
 * @property {Set<TypedIdentifier>} remove
 * @property {Teriock.System.FormulaString} qualifier
 */
export default class ToggleChildrenAutomation
  extends mixClasses(CritMechanicMixin(BaseAutomation), automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ToggleChildren"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ToggleChildren.LABEL";
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { choices: { update: TERIOCK.config.trigger.update } });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "toggleChildren";
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
  get _formPaths() {
    return ["add", "remove", "qualifier", ...this._triggerPaths];
  }

  async _preFire() {
    if (this.document && BaseRoll.qualify(this.qualifier, this.getRollData())) {
      await ensureChildren(this.document, Array.from(this.add));
      await ensureNoChildren(this.document, Array.from(this.remove));
    }
  }
}
