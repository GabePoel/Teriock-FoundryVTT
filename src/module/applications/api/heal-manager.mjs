import { takeOptions } from "../../constants/options/take-options.mjs";
import { buttonHandlers } from "../../helpers/interaction/_module.mjs";
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
      icon: makeIconClass(takeOptions.healing.icon, "title"),
      title: "TERIOCK.DIALOGS.Heal.title",
      resizable: false,
    },
  };

  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/dialog-templates/heal.hbs",
      scrollable: [""],
    },
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
      hint: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.HealAutomation.FIELDS.forHarm.hint",
      ),
      initial: false,
      label: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.HealAutomation.FIELDS.forHarm.label",
      ),
    });
    this._consumeStatDiceField = new fields.BooleanField({
      hint: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.HealAutomation.FIELDS.consumeStatDice.hint",
      ),
      initial: true,
      label: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.HealAutomation.FIELDS.consumeStatDice.label",
      ),
    });
  }

  /**
   * @inheritDoc
   * @this {TeriockHealManager}
   */
  static async _onRollStatDie(event, target) {
    const statDie = this._getStatDie(target);
    if (this._forHarm) {
      const takeHandler = new buttonHandlers["roll-rollable-take"](
        event,
        target,
      );
      takeHandler.dataset = {
        type: "damage",
        formula: statDie.formula.replace("hp", "holy"),
      };
      await takeHandler.secondaryAction();
    } else {
      await statDie.use(this._consumeStatDice);
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // Hacks work the opposite way they do on character sheets.
    this.element.querySelectorAll(".hack-marker-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) {
          return;
        }
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */
          el.dataset.part;
        await this.document.system.takeHack(part);
        e.stopPropagation();
      });
    });
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.noDice = this._noDice;
    return context;
  }
}
