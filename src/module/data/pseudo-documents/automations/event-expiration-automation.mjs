import { triggers } from "../../../constants/system/_module.mjs";
import { formatDynamicSelectOptions } from "../../../helpers/utils.mjs";
import { conditionRequirementsField } from "../../fields/helpers/builders.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {{conditions: boolean, triggers: boolean}} override
 * @property {{absent: Set<Teriock.Keys.Condition>, present: Set<Teriock.Keys.Condition>}} conditions
 * @property {Set<string>} triggers
 * @todo Merge with {@link CombatExpirationAutomation}.
 */
export default class EventExpirationAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.EventExpiration",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.EventExpiration.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "eventExpiration";
  }

  /**
   * Trigger choices.
   * @returns {Record<string, FormSelectOption>}
   */
  static get _triggerChoices() {
    return formatDynamicSelectOptions(
      {
        activity: triggers.activity,
        combat: triggers.combat,
        consequence: triggers.consequence,
        execution: triggers.execution,
        impact: triggers.impact,
        time: triggers.time,
      },
      { localize: true },
    );
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      conditions: conditionRequirementsField(),
      override: new fields.SchemaField({
        conditions: new fields.BooleanField(),
        triggers: new fields.BooleanField(),
      }),
      triggers: new fields.SetField(
        new fields.StringField({ choices: this._triggerChoices }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["override.conditions"];
    if (this.override.conditions) {
      paths.push(...["conditions.present", "conditions.absent"]);
    }
    paths.push(...["hr", "override.triggers"]);
    if (this.override.triggers) paths.push("triggers");
    return paths;
  }

  /**
   * Expiration data that gets added to an effect.
   * @returns {object}
   */
  getExpirationData() {
    const out = {};
    if (this.override.conditions) {
      out.conditions = {
        absent: Array.from(this.conditions.absent),
        present: Array.from(this.conditions.present),
      };
    }
    if (this.override.triggers) out.triggers = Array.from(this.triggers);
    return out;
  }
}
