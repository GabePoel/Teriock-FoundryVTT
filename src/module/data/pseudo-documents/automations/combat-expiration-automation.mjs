import { builders } from "../../fields/helpers/_module.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

export default class CombatExpirationAutomation extends CritAutomation {
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
    paths.push(
      ...["when.time", "when.trigger", "who.type", ...super._formPaths],
    );
    return paths;
  }
}
