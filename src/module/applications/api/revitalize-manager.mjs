import { takeOptions } from "../../constants/options/take-options.mjs";
import { buttonHandlers } from "../../helpers/interaction/_module.mjs";
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
      icon: makeIconClass(takeOptions.revitalizing.icon, "title"),
      title: "TERIOCK.DIALOGS.Revitalize.title",
      resizable: false,
    },
  };

  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/dialogs/revitalize.hbs",
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
      hint: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RevitalizeAutomation.forHarm.hint",
      ),
      initial: false,
      label: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RevitalizeAutomation.forHarm.label",
      ),
    });
    this._consumeStatDiceField = new fields.BooleanField({
      hint: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RevitalizeAutomation.forHarm.hint",
      ),
      initial: true,
      label: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RevitalizeAutomation.consumeStatDice.label",
      ),
    });
  }

  /** @inheritDoc */
  static async _onRollStatDie(event, target) {
    const statDie = this._getStatDie(target);
    if (this._forHarm) {
      const takeHandler = new buttonHandlers["roll-rollable-take"](
        event,
        target,
      );
      takeHandler.dataset = {
        type: "drain",
        formula: statDie.formula.replace("mp", "mana"),
      };
      await takeHandler.secondaryAction();
    } else {
      await super._onRollStatDie(event, target);
    }
  }
}
