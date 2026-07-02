import impactConfig from "../../constants/config/impact-config.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { makeIcon } from "../../helpers/icon.mjs";
import BaseRoll from "./base-roll.mjs";

/**
 * @property {Teriock.Keys.Impact} impact
 */
export default class ImpactRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @returns {Teriock.Dice.ImpactRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, { impact: "other" });
  }

  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.ImpactRollOptions>} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.#setImpactFlavor();
  }

  /**
   * Set the flavor if there's not one already defined.
   */
  #setImpactFlavor() {
    if (this.hasImpact) {
      this.options.flavor ??= _loc("TERIOCK.ROLLS.Base.name", { value: impactConfig[this.impact]?.label });
    }
  }

  /**
   * Whether this roll has an impact associated with it.
   * @returns {boolean}
   */
  get hasImpact() {
    return this.impact && this.impact !== "other";
  }

  /**
   * The impact associated with this roll.
   * @returns {Teriock.Keys.Impact}
   */
  get impact() {
    return this.options.impact;
  }

  /**
   * The impact associated with this roll.
   * @param impact
   */
  set impact(impact) {
    this.options.impact = impact;
    this.#setImpactFlavor();
  }

  /** @inheritDoc */
  _getFormulaContextOptions(options = {}) {
    return [{
      icon: makeIcon(TERIOCK.display.icons.roll.boost, "contextMenu"),
      label: "TERIOCK.DIALOGS.Boost.FIELDS.boosts.single",
      onClick: async () => {
        const boostedRoll = await this.boost(this.options);
        await boostedRoll.toMessage(options.messageData ?? { speaker: TeriockChatMessage.getSpeaker() });
      },
    }, {
      icon: makeIcon(TERIOCK.display.icons.roll.deboost, "contextMenu"),
      label: "TERIOCK.DIALOGS.Boost.FIELDS.deboosts.single",
      onClick: async () => {
        const deboostedRoll = await this.deboost(this.options);
        await deboostedRoll.toMessage(options.messageData ?? { speaker: TeriockChatMessage.getSpeaker() });
      },
    }, ...super._getFormulaContextOptions(options)];
  }

  /** @inheritDoc */
  _getTotalContextOptions(_options = {}) {
    return [
      ...Object.values(impactConfig).filter(option => !option?.hidden).map(option => {
        return {
          icon: makeIcon(option.icon, "contextMenu"),
          label: option.take,
          onClick: async () => await Promise.all(game.actors.selected.map(a => option.apply(a, this.total))),
        };
      }),
      ...super._getTotalContextOptions(_options),
    ];
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.hasImpact) {
      return [new teriock.data.pseudoDocuments.activations.TakeActivation({ amount: this.total, impact: this.impact })];
    }
    return [];
  }
}
