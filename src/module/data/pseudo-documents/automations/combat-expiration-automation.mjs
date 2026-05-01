import { builders } from "../../fields/helpers/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {CombatExpirationIndividual} who
 * @property {CombatExpirationMethod} what
 * @property {CombatExpirationTiming} when
 * @todo Merge with {@link CombatExpirationAutomation}.
 */
export default class CombatExpirationAutomation extends CritAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.CombatExpiration.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "combatExpiration";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      who: new fields.SchemaField({
        type: builders.combatExpirationSourceTypeField(),
      }),
      what: builders.combatExpirationMethodField(),
      when: builders.combatExpirationTimingField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["what.type"];
    if (this.what.type === "rolled") {
      paths.push(...["what.roll", "what.threshold"]);
    }
    if (this.what.type !== "none") {
      paths.push(...["when.time", "when.trigger", "when.skip", "who.type"]);
    }
    paths.push(...super._formPaths);
    return paths;
  }

  /** @inheritDoc */
  get formMessages() {
    const messages = super.formMessages;
    if (this.isPassive) {
      messages.unshift({
        level: "error",
        text: "TERIOCK.AUTOMATIONS.CombatExpiration.NOTIFICATIONS.passive",
      });
    }
    return messages;
  }
}
