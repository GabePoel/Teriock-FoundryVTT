import {
  TakeHackHandler,
  TakeUnhackHandler,
} from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Parameters.Actor.HackableBodyPart>} hacks
 */
export default class HacksAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.HacksAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.HacksAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "hacks";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      hacks: new fields.SetField(
        new fields.StringField({
          choices: Object.fromEntries(
            Object.entries(TERIOCK.options.hack).map(([k, v]) => [
              k,
              v.label.replace("Hack", "").trim(),
            ]),
          ),
        }),
        {
          label: "TERIOCK.TERMS.Common.hacks",
        },
      ),
      reverse: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hacks", "reverse"];
  }

  /** @inheritDoc */
  get buttons() {
    if (this.reverse) {
      return Array.from(this.hacks).map((hack) =>
        TakeUnhackHandler.buildButton(hack),
      );
    } else {
      return Array.from(this.hacks).map((hack) =>
        TakeHackHandler.buildButton(hack),
      );
    }
  }
}
