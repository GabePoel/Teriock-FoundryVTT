import impactConfig from "../../../constants/config/impact-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseStatManager from "./base-stat-manager.mjs";

const { fields } = foundry.data;

export default class RevitalizeManager extends BaseStatManager {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { rollStatDie: this._onRollStatDie },
    window: {
      icon: makeIconClass(impactConfig.revitalizing.icon, "title"),
      resizable: false,
      title: "TERIOCK.DIALOGS.Revitalize.title",
    },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { all: { scrollable: [""], template: "teriock/dialogs/revitalize-manager" } };

  /** @inheritDoc */
  static async _onRollStatDie(event, target) {
    const statDie = this._getStatDie(target);
    if (this.state.forHarm) {
      const rollActivation = new teriock.data.pseudoDocuments.activations.RollActivation({
        formula: this._getStatDieRollFormula(statDie.formula.replace("mp", "mana")),
        impact: "drain",
      });
      rollActivation.event = event;
      await rollActivation.primaryAction();
      if (this.state.consumeStatDice) { await statDie.toggle(true); }
    } else {
      await super._onRollStatDie(event, target);
    }
  }

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
      hint: _loc("TERIOCK.AUTOMATIONS.Revitalize.consumeStatDice.hint"),
      initial: true,
      label: _loc("TERIOCK.AUTOMATIONS.Revitalize.consumeStatDice.label"),
    });
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.EFFECTS.Common.revitalize";
  }
}
