import ShortRestExecution from "./short-rest-execution.mjs";

const { fields } = foundry.data;

export default class LongRestExecution extends ShortRestExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.LongRest"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      restoreHp: new fields.BooleanField({ initial: true }),
      restoreHpDice: new fields.BooleanField({ initial: true }),
      restoreMp: new fields.BooleanField({ initial: true }),
      restoreMpDice: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["restoreHp", "restoreMp", "restoreHpDice", "restoreMpDice", ...super._formPaths];
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
  async _performUpdates() {
    const yes = await super._performUpdates();
    if (yes === false) { return false; }

    await this.actor.system.partialReset({
      hp: this.restoreHp,
      hpDice: this.restoreHpDice,
      mp: this.restoreMp,
      mpDice: this.restoreMpDice,
    });
  }
}
