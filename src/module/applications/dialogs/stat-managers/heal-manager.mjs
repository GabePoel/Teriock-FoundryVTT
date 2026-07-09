import impactConfig from "../../../constants/config/impact-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseStatManager from "./base-stat-manager.mjs";

const { fields } = foundry.data;

export default class HealManager extends BaseStatManager {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { rollStatDie: this._onRollStatDie, takeHack: this._onTakeUnhack },
    window: {
      icon: makeIconClass(impactConfig.healing.icon, "title"),
      resizable: false,
      title: "TERIOCK.DIALOGS.Heal.title",
    },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { all: { scrollable: [""], template: "teriock/dialogs/heal-manager" } };

  /**
   * @inheritDoc
   * @this {HealManager}
   */
  static async _onRollStatDie(event, target) {
    const statDie = this._getStatDie(target);
    if (this.state.forHarm) {
      const rollActivation = new teriock.data.pseudoDocuments.activations.RollActivation({
        formula: this._getStatDieRollFormula(statDie.formula.replace("hp", "holy")),
        impact: "damage",
      });
      rollActivation.event = event;
      await rollActivation.primaryAction();
      if (this.state.consumeStatDice) { await statDie.toggle(true); }
    } else {
      await statDie.use(this.state.consumeStatDice, { substitution: this.state.substitution });
    }
  }

  /**
   * Creates a new healing manager instance.
   * @param {TeriockActor} actor
   * @param {Teriock.Dialog.HealDialogOptions} [options]
   * @param {...any} args
   */
  constructor(actor, options, ...args) {
    super(actor, options, ...args);
    const { noStatDice = false } = options;
    this._noDice = noStatDice;
    this._forHarmField = new fields.BooleanField({
      hint: _loc("TERIOCK.AUTOMATIONS.Heal.FIELDS.forHarm.hint"),
      initial: false,
      label: _loc("TERIOCK.AUTOMATIONS.Heal.FIELDS.forHarm.label"),
    });
    this._consumeStatDiceField = new fields.BooleanField({
      hint: _loc("TERIOCK.AUTOMATIONS.Heal.FIELDS.consumeStatDice.hint"),
      initial: true,
      label: _loc("TERIOCK.AUTOMATIONS.Heal.FIELDS.consumeStatDice.label"),
    });
  }

  /** @inheritDoc */
  get _hackForward() {
    return false;
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.EFFECTS.Common.heal";
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), { noDice: this._noDice });
  }
}
