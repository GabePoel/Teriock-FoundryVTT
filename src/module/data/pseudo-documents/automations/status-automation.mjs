import ChatStatusAutomation from "./chat-status-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {"apply"|"remove"|"toggle"|"include"} relation
 * @property {boolean} executor
 * @property {boolean} multi
 * @property {boolean} target
 */
export default class StatusAutomation extends ChatStatusAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Status"];

  /** @inheritDoc */
  static get _relationChoices() {
    return { ...super._relationChoices, include: _loc("TERIOCK.AUTOMATIONS.Status.FIELDS.relation.choices.include") };
  }

  /** @inheritDoc */
  static get _relationInitial() {
    return "include";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "status";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      executor: new fields.BooleanField(),
      multi: new fields.BooleanField(),
      target: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = super._formPaths;
    if (this.relation === "include" && !this.isPassive) {
      paths.push(...["hr", "executor", "target"]);
      if (this.target) paths.push("multi");
    }
    return paths;
  }

  /**
   * Select visible tokens to associate this status with.
   * @param {Teriock.SelectOptions.DocumentsSelect} options
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async selectVisibleTokens(options = {}) {
    return game.user.selectVisibleTokens({
      hint: _loc("TERIOCK.AUTOMATIONS.Status.DIALOGS.SelectVisibleTokens.hint", {
        effect: this.document?.name || _loc("TERIOCK.AUTOMATIONS.Status.DIALOGS.SelectVisibleTokens.effect"),
        status: TERIOCK.reference.conditions[this.status],
      }),
      multi: this.multi,
      ...options,
    });
  }
}
