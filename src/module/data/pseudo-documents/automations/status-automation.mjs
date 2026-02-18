import ChatStatusAutomation from "./chat-status-automation.mjs";

const { fields } = foundry.data;

/**
 * @param {"apply"|"remove"|"toggle"|"include"} relation
 * @param {boolean} target
 * @param {boolean} executor
 */
export default class StatusAutomation extends ChatStatusAutomation {
  /** @inheritDoc */
  static get TYPE() {
    return "status";
  }

  static get _relationChoices() {
    return {
      ...super._relationChoices,
      include: "Include",
    };
  }

  static get _relationHint() {
    return (
      super._relationHint +
      " Apply, remove, toggle, or include the condition as part of the ability's effect."
    );
  }

  static get _relationInitial() {
    return "include";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
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
    const paths = super._formPaths;
    if (this.relation === "include" && !this.isPassive)
      paths.push(...["target", "executor"]);
    return paths;
  }
}
