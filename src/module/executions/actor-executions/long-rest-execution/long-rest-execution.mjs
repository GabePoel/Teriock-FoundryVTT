import ShortRestExecution from "../short-rest-execution/short-rest-execution.mjs";

const { fields } = foundry.data;

export default class LongRestExecution extends ShortRestExecution {
  /**
   * @param {Partial<Teriock.Execution.LongRestExecutionOptions>} options
   */
  constructor(options = {}) {
    super(options);
    this.restoreHp = options.restoreHp ?? true;
    this.restoreMp = options.restoreMp ?? true;
    this.restoreHpDice = options.restoreHpDice ?? true;
    this.restoreMpDice = options.restoreMpDice ?? true;
  }

  /** @type {boolean} */
  restoreHp = true;

  /** @type {boolean} */
  restoreHpDice = true;

  /** @type {boolean} */
  restoreMp = true;

  /** @type {boolean} */
  restoreMpDice = true;

  /** @inheritDoc */
  get _dialogFields() {
    return [{
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.DIALOGS.LongRest.FIELDS.hp.hint",
      label: "TERIOCK.DIALOGS.LongRest.FIELDS.hp.label",
      name: "restoreHp",
      small: true,
      value: this.restoreHp,
      update: v => (this.restoreHp = Boolean(v)),
    }, {
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.DIALOGS.LongRest.FIELDS.mp.hint",
      label: "TERIOCK.DIALOGS.LongRest.FIELDS.mp.label",
      name: "restoreMp",
      small: true,
      value: this.restoreMp,
      update: v => (this.restoreMp = Boolean(v)),
    }, {
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.DIALOGS.LongRest.FIELDS.hpDice.hint",
      label: "TERIOCK.DIALOGS.LongRest.FIELDS.hpDice.label",
      name: "restoreHpDice",
      small: true,
      value: this.restoreHpDice,
      update: v => (this.restoreHpDice = Boolean(v)),
    }, {
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.DIALOGS.LongRest.FIELDS.mpDice.hint",
      label: "TERIOCK.DIALOGS.LongRest.FIELDS.mpDice.label",
      name: "restoreMpDice",
      small: true,
      value: this.restoreMpDice,
      update: v => (this.restoreMpDice = Boolean(v)),
    }, ...super._dialogFields];
  }

  /** @inheritDoc */
  get executionTime() {
    return "longRest";
  }

  /** @inheritDoc */
  async _buildTags() {
    if (this.restoreHp) { this.tags.push(_loc("TERIOCK.DIALOGS.LongRest.TAGS.hp")); }
    if (this.restoreMp) { this.tags.push(_loc("TERIOCK.DIALOGS.LongRest.TAGS.mp")); }
    if (this.restoreHpDice) { this.tags.push(_loc("TERIOCK.DIALOGS.LongRest.TAGS.hpDice")); }
    if (this.restoreMpDice) { this.tags.push(_loc("TERIOCK.DIALOGS.LongRest.TAGS.mpDice")); }
  }

  /** @inheritDoc */
  async _updateActor() {
    await this.actor.system.partialReset({
      hp: this.restoreHp,
      hpDice: this.restoreHpDice,
      mp: this.restoreMp,
      mpDice: this.restoreMpDice,
    });
    return super._updateActor();
  }
}
