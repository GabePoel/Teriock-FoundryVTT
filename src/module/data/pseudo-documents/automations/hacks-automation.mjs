import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { TakeHackActivation, TakeUnhackActivation } from "../activations/command-activations.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 * @property {Set<Teriock.Keys.HackableBodyPart>} hacks
 */
export default class HacksAutomation extends automationMixins.TriggerAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Hacks"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Hacks.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "hacks";
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
