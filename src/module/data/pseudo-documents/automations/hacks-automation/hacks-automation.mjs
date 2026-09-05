import { mixClasses } from "../../../../helpers/construction.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { TakeHackActivation, TakeUnhackActivation } from "../../activations/command-activations.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class HacksAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Hacks"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "hacks" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      hacks: new fields.SetField(
        new fields.StringField({ choices: localizeChoices(objectMap(TERIOCK.config.hack, h => h.part)) }),
        { label: "TERIOCK.COMMON.Hacks" },
      ),
      reverse: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hacks", "reverse", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.reverse) { return Array.from(this.hacks).map(h => new TakeUnhackActivation({ options: { part: h } })); }
    return Array.from(this.hacks).map(h => new TakeHackActivation({ options: { part: h } }));
  }
}
