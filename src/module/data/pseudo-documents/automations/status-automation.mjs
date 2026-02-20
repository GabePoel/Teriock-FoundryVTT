import ChatStatusAutomation from "./chat-status-automation.mjs";

const { fields } = foundry.data;

/**
 * @param {"apply"|"remove"|"toggle"|"include"} relation
 * @param {boolean} target
 * @param {boolean} executor
 */
export default class StatusAutomation extends ChatStatusAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.StatusAutomation",
  ];

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

  static get _relationInitial() {
    return "include";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      executor: new fields.BooleanField(),
      target: new fields.BooleanField(),
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
