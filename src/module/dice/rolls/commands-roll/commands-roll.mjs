import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { listFormat } from "../../../helpers/localization.mjs";
import { makeIcon } from "../../../utils/_module.mjs";
import BaseRoll from "../base-roll/base-roll.mjs";

export default class CommandsRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @returns {Teriock.Dice.CommandsRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, { commands: [] });
  }

  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.CommandsRollOptions>} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.#setCommandFlavor();
  }

  /**
   * Set the flavor if there's not one already defined.
   */
  #setCommandFlavor() {
    if (!this.options.flavor) { this.options.autoFlavor = true; }
    if (!this.options.autoFlavor) { return; }
    if (!this.commands.length) { delete this.options.flavor; }
    else {
      const commandLabels = this.commands.map(i => TERIOCK.CONFIG.command[i]?.label);
      this.options.flavor = _loc("TERIOCK.ROLLS.Base.name", { value: listFormat(commandLabels, { style: "short" }) });
    }
  }

  /**
   * The commands associated with this roll, excluding the placeholder one.
   * @returns {Teriock.Keys.Command[]}
   */
  get commands() {
    return this.options.commands.filter(i => i !== "other");
  }

  /**
   * The commands associated with this roll.
   * @param {Iterable<Teriock.Keys.Command>} commands
   */
  set commands(commands) {
    this.options.commands = Array.from(commands);
    this.#setCommandFlavor();
  }

  /** @inheritDoc */
  _getFormulaContextOptions(config = {}) {
    const boostable = () => this.dice.length > 0 || game.settings.get("teriock", "numericalBoostsAndDeboosts");
    return [{
      icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.roll.boost, "contextMenu"),
      label: "TERIOCK.DIALOGS.Boost.FIELDS.boosts.single",
      visible: boostable,
      onClick: async () => {
        const newRoll = await this.boost(this.options);
        await newRoll.toMessage({ speaker: TeriockChatMessage.getSpeaker(), ...config.messageData });
      },
    }, {
      icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.roll.deboost, "contextMenu"),
      label: "TERIOCK.DIALOGS.Boost.FIELDS.deboosts.single",
      visible: boostable,
      onClick: async () => {
        const newRoll = await this.deboost(this.options);
        await newRoll.toMessage({ speaker: TeriockChatMessage.getSpeaker(), ...config.messageData });
      },
    }, ...super._getFormulaContextOptions(config)];
  }

  /** @inheritDoc */
  _getTotalContextOptions(_config = {}) {
    return [
      ...Object.entries(TERIOCK.CONFIG.command).filter(([_k, v]) => v.numeric && !v.numeric.hidden).map(([k, v]) => {
        return {
          icon: makeIcon(v.icon, "contextMenu"),
          label: v.numeric.take,
          onClick: async () =>
            await new teriock.data.pseudoDocuments.activations.TakeActivation({ amount: this.total, command: k })
              .primaryAction(),
        };
      }),
      ...super._getTotalContextOptions(_config),
    ];
  }

  /** @inheritDoc */
  async getAutomations() {
    return this.commands.map(command =>
      new teriock.data.pseudoDocuments.automations.TakeAutomation({ amount: this.total, command, type: "take" })
    );
  }
}
