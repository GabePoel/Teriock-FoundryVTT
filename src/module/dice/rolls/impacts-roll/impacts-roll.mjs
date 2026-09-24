import impactConfig from "../../../constants/config/impact-config.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { makeIcon } from "../../../helpers/icon.mjs";
import { listFormat } from "../../../helpers/localization.mjs";
import BaseRoll from "../base-roll/base-roll.mjs";

export default class ImpactsRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @returns {Teriock.Dice.ImpactsRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, { impacts: [] });
  }

  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.ImpactsRollOptions>} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.#setImpactFlavor();
  }

  /**
   * Set the flavor if there's not one already defined.
   */
  #setImpactFlavor() {
    if (!this.options.flavor) { this.options.autoFlavor = true; }
    if (!this.options.autoFlavor) { return; }
    if (!this.impacts.length) { delete this.options.flavor; }
    else {
      const impactLabels = this.impacts.map(i => impactConfig[i]?.label);
      this.options.flavor = _loc("TERIOCK.ROLLS.Base.name", { value: listFormat(impactLabels, { style: "short" }) });
    }
  }

  /**
   * The impacts associated with this roll, excluding the placeholder one.
   * @returns {Teriock.Keys.Impact[]}
   */
  get impacts() {
    return this.options.impacts.filter(i => i !== "other");
  }

  /**
   * The impacts associated with this roll.
   * @param {Iterable<Teriock.Keys.Impact>} impacts
   */
  set impacts(impacts) {
    this.options.impacts = Array.from(impacts);
    this.#setImpactFlavor();
  }

  /** @inheritDoc */
  _getFormulaContextOptions(config = {}) {
    return [{
      icon: makeIcon(TERIOCK.display.icons.manifest.roll.boost, "contextMenu"),
      label: "TERIOCK.DIALOGS.Boost.FIELDS.boosts.single",
      onClick: async () => {
        const newRoll = await this.boost(this.options);
        await newRoll.toMessage(config.messageData ?? { speaker: TeriockChatMessage.getSpeaker() });
      },
    }, {
      icon: makeIcon(TERIOCK.display.icons.manifest.roll.deboost, "contextMenu"),
      label: "TERIOCK.DIALOGS.Boost.FIELDS.deboosts.single",
      onClick: async () => {
        const newRoll = await this.deboost(this.options);
        await newRoll.toMessage(config.messageData ?? { speaker: TeriockChatMessage.getSpeaker() });
      },
    }, ...super._getFormulaContextOptions(config)];
  }

  /** @inheritDoc */
  _getTotalContextOptions(_config = {}) {
    return [
      ...Object.entries(impactConfig).filter(([_k, v]) => !v?.hidden).map(([k, v]) => {
        return {
          icon: makeIcon(v.icon, "contextMenu"),
          label: v.take,
          onClick: async () =>
            await new teriock.data.pseudoDocuments.activations.TakeActivation({ amount: this.total, impact: k })
              .primaryAction(),
        };
      }),
      ...super._getTotalContextOptions(_config),
    ];
  }

  /** @inheritDoc */
  async getAutomations() {
    return this.impacts.map(impact =>
      new teriock.data.pseudoDocuments.automations.TakeAutomation({ amount: this.total, impact, type: "take" })
    );
  }
}
