import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { TakeHackActivation, TakeUnhackActivation } from "../activations/command-activations.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Keys.HackableBodyPart>} hacks
 */
export default class HacksAutomation extends BaseAutomation {
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
        { label: "TERIOCK.TERMS.Common.hacks" },
      ),
      reverse: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hacks", "reverse"];
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.reverse) return Array.from(this.hacks).map(h => new TakeUnhackActivation({ options: { part: h } }));
    else return Array.from(this.hacks).map(h => new TakeHackActivation({ options: { part: h } }));
  }
}
