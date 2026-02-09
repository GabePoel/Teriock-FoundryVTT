import {
  ApplyStatusHandler,
  RemoveStatusHandler,
  ToggleStatusHandler,
} from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

/**
 * @param {"apply"|"remove"|"toggle"|"inclde"} relation
 * @param {boolean} target
 * @param {boolean} executor
 */
export default class StatusAutomation extends CritAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Condition";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "status";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      status: new fields.StringField({
        choices: TERIOCK.index.conditions,
        label: "Condition",
      }),
      relation: new fields.StringField({
        choices: {
          apply: "Apply",
          remove: "Remove",
          toggle: "Toggle",
          include: "Include",
        },
        initial: "include",
        nullable: false,
        label: "Relation",
        hint:
          "What the relationship between the ability and effect is. Apply, remove, toggle, or include the" +
          " condition as part of the ability's effect.",
      }),
      target: new fields.BooleanField({
        label: "Select Associations",
        hint: "Whether to open a dialog to select tokens that will be associated with this condition.",
      }),
      executor: new fields.BooleanField({
        label: "Associate Executor",
        hint: "Whether the creature that executes the ability will be associated with this condition.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["status", "relation"];
    if (this.relation === "include") paths.push(...["target", "executor"]);
    return paths;
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
