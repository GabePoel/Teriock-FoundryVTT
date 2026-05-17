import { formatDynamicSelectOptions } from "../../../helpers/utils.mjs";
import * as builders from "../../fields/helpers/builders.mjs";
import { conditionRequirementsField } from "../../fields/helpers/builders.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {CombatExpiration} combat
 * @property {Set<string>} triggers
 * @property {{absent: Set<Teriock.Keys.Condition>, present: Set<Teriock.Keys.Condition>}} conditions
 * @property {{conditions: boolean, triggers: boolean}} override
 */
export default class ExpirationAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Expiration"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Expiration.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "expiration";
  }

  /**
   * Trigger choices.
   * @returns {Record<string, FormSelectOption>}
   */
  static get _triggerChoices() {
    return formatDynamicSelectOptions(
      {
        activity: TERIOCK.config.trigger.activity,
        combat: TERIOCK.config.trigger.combat,
        consequence: TERIOCK.config.trigger.consequence,
        execution: TERIOCK.config.trigger.execution,
        impact: TERIOCK.config.trigger.impact,
        time: TERIOCK.config.trigger.time,
      },
      { localize: true },
    );
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      combat: new fields.SchemaField({
        who: new fields.SchemaField({
          type: builders.combatExpirationSourceTypeField(),
        }),
        what: builders.combatExpirationMethodField(),
        when: builders.combatExpirationTimingField(),
      }),
      conditions: conditionRequirementsField(),
      override: new fields.SchemaField({
        combat: new fields.BooleanField(),
        conditions: new fields.BooleanField(),
        triggers: new fields.BooleanField(),
      }),
      triggers: new fields.SetField(new fields.StringField({ choices: this._triggerChoices })),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._overrideCombatPaths, "hr", ...this._overrideConditionsPaths, "hr", ...this._overrideTriggersPaths];
  }

  /** @returns {string[]} */
  get _overrideCombatPaths() {
    const paths = ["override.combat"];
    if (this.override.combat) {
      paths.push("combat.what.type");
      if (this.combat.what.type === "rolled") {
        paths.push(...["combat.what.roll", "combat.what.threshold"]);
      }
      if (this.combat.what.type !== "none") {
        paths.push(...["combat.when.time", "combat.when.trigger", "combat.when.skip", "combat.who.type"]);
      }
    }
    return paths;
  }

  /** @returns {string[]} */
  get _overrideConditionsPaths() {
    const paths = ["override.conditions"];
    if (this.override.conditions) {
      paths.push(...["conditions.present", "conditions.absent"]);
    }
    return paths;
  }

  /** @returns {string[]} */
  get _overrideTriggersPaths() {
    const paths = ["override.triggers"];
    if (this.override.triggers) paths.push("triggers");
    return paths;
  }

  /** @inheritDoc */
  get formMessages() {
    const messages = super.formMessages;
    if (this.isPassive) {
      messages.unshift({
        level: "error",
        text: "TERIOCK.AUTOMATIONS.Expiration.NOTIFICATIONS.passive",
      });
    }
    return messages;
  }

  /**
   * Expiration data that gets added to an effect.
   * @param {object} [options]
   * @param {AnyActor} [options.actor]
   * @returns {object}
   */
  getExpirationData(options = {}) {
    const obj = this.toObject();
    const out = {};
    if (this.override.conditions) out.conditions = obj?.conditions;
    if (this.override.triggers) out.triggers = obj?.triggers;
    if (this.override.combat) {
      out.combat = obj?.combat;
      if (options.actor) {
        foundry.utils.setProperty(out, "combat.who.source", options.actor.uuid);
      }
    }
    return out;
  }
}
