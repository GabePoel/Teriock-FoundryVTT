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
  static get LABEL() {
    return "Hacks";
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
          label: "Hacks",
          hint: "The types of hack damage that this can apply.",
        },
      ),
      reverse: new fields.BooleanField({
        label: "Reverse",
        hint: "Remove hacks instead of adding them.",
      }),
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
