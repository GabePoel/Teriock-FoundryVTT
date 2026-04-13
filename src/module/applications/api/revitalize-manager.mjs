import { impactOptions } from "../../constants/options/impact-options.mjs";
import { RollActivation } from "../../data/pseudo-documents/activations/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import TeriockStatManager from "./stat-manager.mjs";

const { fields } = foundry.data;

export default class TeriockRevitalizeManager extends TeriockStatManager {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: {
      rollStatDie: this._onRollStatDie,
    },
    window: {
      icon: makeIconClass(impactOptions.revitalizing.icon, "title"),
      title: "TERIOCK.DIALOGS.Revitalize.title",
      resizable: false,
    },
  };

  static PARTS = {
    all: {
      template: "teriock/dialogs/revitalize",
      scrollable: [""],
    },
  };

  /**
   * Creates a new revitalization manager instance.
   * @param {TeriockActor} actor
   * @param {Teriock.Dialog.StatDialogOptions} [options]
   * @param {...any} args
   */
  constructor(actor, options, ...args) {
    super(actor, options, ...args);
    this._forHarmField = new fields.BooleanField({
      hint: _loc("TERIOCK.AUTOMATIONS.Revitalize.forHarm.hint"),
      initial: false,
      label: _loc("TERIOCK.AUTOMATIONS.Revitalize.forHarm.label"),
    });
    this._consumeStatDiceField = new fields.BooleanField({
      hint: _loc("TERIOCK.AUTOMATIONS.Revitalize.forHarm.hint"),
      initial: true,
      label: _loc("TERIOCK.AUTOMATIONS.Revitalize.consumeStatDice.label"),
    });
  }

  /** @inheritDoc */
  static async _onRollStatDie(event, target) {
    const statDie = this._getStatDie(target);
    if (this._forHarm) {
      const rollActivation = new RollActivation({
        formula: statDie.formula.replace("mp", "mana"),
        roll: "drain",
      });
      rollActivation.event = event;
      await rollActivation.primaryAction();
      if (this._consumeStatDice) await statDie.toggle(true);
    } else {
      await super._onRollStatDie(event, target);
    }
  }
}
