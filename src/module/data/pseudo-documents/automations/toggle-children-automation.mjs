import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { ensureChildren, ensureNoChildren } from "../../../helpers/resolve.mjs";
import { FormulaField, TypedIdentifierSetField } from "../../fields/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @property {Set<TypedIdentifier>} add
 * @property {Set<TypedIdentifier>} remove
 * @property {Teriock.System.FormulaString} qualifier
 * @extends {CritAutomation}
 * @mixes TriggerAutomation
 */
export default class ToggleChildrenAutomation
  extends mixClasses(CritAutomation, automationMixins.TriggerAutomationMixin)
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
      qualifier: new FormulaField({ initial: "0" }),
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
