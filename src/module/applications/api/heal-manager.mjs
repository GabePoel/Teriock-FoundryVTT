import { RollRollableTakeHandler } from "../../helpers/interaction/action-handler/instances/rollable-takes-handlers.mjs";
import TeriockStatManager from "./stat-manager.mjs";

const { fields } = foundry.data;

export default class TeriockHealManager extends TeriockStatManager {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: {
      rollStatDie: this._rollStatDie,
      takeHack: this._takeUnhack,
    },
    window: {
      icon: "fa-solid fa-hand-holding-heart",
      title: "Healing",
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
      initial: false,
      label: "For Damage",
      hint: "Check this is the healing should be done for damage.",
    });
    this._consumeStatDiceField = new fields.BooleanField({
      initial: true,
      label: "Consume Hit Dice",
      hint: "Check this if hit dice should be consumed on use.",
    });
  }

  /** @inheritDoc */
  static async _rollStatDie(event, target) {
    const id = target.dataset.document;
    const collection = target.dataset.collection;
    const stat = target.dataset.stat;
    const index = target.dataset.index;
    const item =
      /** @type {TeriockChild & {system: StatGiverMixinInterface}} */
      this.actor[collection].get(id);
    const statDie =
      /** @type {StatDieModel} */ item.system.statDice[stat].dice[
        Number(index)
      ];
    //noinspection JSUnresolvedReference
    if (this._forHarm) {
      const takeHandler = new RollRollableTakeHandler(event, target);
      takeHandler.dataset = {
        type: "damage",
        formula: `${statDie.formula}[holy]`,
      };
      await takeHandler.secondaryAction();
    } else {
      //noinspection JSUnresolvedReference
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
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ el.dataset
            .part;
        await this.actor.system.takeHack(part);
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
