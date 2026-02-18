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
  static get LABEL() {
    return "Condition";
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

  static get _relationHint() {
    return "What the relationship between the effect and condition is.";
  }

  static get _relationInitial() {
    return "apply";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      status: new fields.StringField({
        choices: TERIOCK.index.conditions,
        label: "Condition",
      }),
      relation: new fields.StringField({
        choices: this._relationChoices,
        initial: this._relationInitial,
        nullable: false,
        label: "Relation",
        hint: this._relationHint,
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
