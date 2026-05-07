import { impactConfig } from "../../constants/config/impact-config.mjs";
import { RollActivation } from "../../data/pseudo-documents/activations/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import TeriockStatManager from "./stat-manager.mjs";

const { fields } = foundry.data;

export default class TeriockHealManager extends TeriockStatManager {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: {
      rollStatDie: this._onRollStatDie,
      takeHack: this._onTakeUnhack,
    },
    window: {
      icon: makeIconClass(impactConfig.healing.icon, "title"),
      title: "TERIOCK.DIALOGS.Heal.title",
      resizable: false,
    },
  };

  static PARTS = {
    all: { scrollable: [""], template: "teriock/dialogs/heal" },
  };

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

  /**
   * @inheritDoc
   * @this {TeriockHealManager}
   */
  static async _onRollStatDie(event, target) {
    const statDie = this._getStatDie(target);
    if (this._forHarm) {
      const rollActivation = new RollActivation({
        formula: statDie.formula.replace("hp", "holy"),
        roll: "damage",
      });
      rollActivation.event = event;
      await rollActivation.primaryAction();
      if (this._consumeStatDice) await statDie.toggle(true);
    } else {
      await statDie.use(this._consumeStatDice);
    }
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
    return Object.assign(await super._prepareContext(options), {
      noDice: this._noDice,
    });
  }
}
