import {
  ApplyStatusHandler,
  RemoveStatusHandler,
  ToggleStatusHandler,
} from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

/**
 * @param {Teriock.Parameters.Condition.ConditionKey} status
 * @param {"apply"|"remove"|"toggle"} relation
 */
export default class ChatStatusAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ChatStatusAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Common.condition";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "chatStatus";
  }

  /**
   * @type {Record<string, string>}
   */
  static get _relationChoices() {
    return {
      apply: "Apply",
      remove: "Remove",
      toggle: "Toggle",
    };
  }

  static get _relationInitial() {
    return "apply";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      status: new fields.StringField({
        choices: TERIOCK.reference.conditions,
        label: "TERIOCK.TERMS.Common.condition",
      }),
      relation: new fields.StringField({
        choices: this._relationChoices,
        initial: this._relationInitial,
        label: "TERIOCK.AUTOMATIONS.BaseAutomation.FIELDS.relation.label",
        nullable: false,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["status", "relation"];
  }

  /** @inheritDoc */
  get buttons() {
    if (this.relation === "apply") {
      return [ApplyStatusHandler.buildButton(this.status)];
    } else if (this.relation === "remove") {
      return [RemoveStatusHandler.buildButton(this.status)];
    } else if (this.relation === "toggle") {
      return [ToggleStatusHandler.buildButton(this.status)];
    } else {
      return [];
    }
  }
}
