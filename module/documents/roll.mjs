// const { DiceTerm } = foundry.dice.terms;

/**
 * A custom Roll class which enriches the provided flavor and uses a custom chat template to display the flavor as enriched HTML.
 */
export default class TeriockRoll extends foundry.dice.Roll {
  static CHAT_TEMPLATE = "systems/teriock/templates/chat/roll.hbs";

  /** @override */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    const defaultOptions = {
      enrich: false,
    };
    options = foundry.utils.mergeObject(defaultOptions, options);
    if (options.enrich && options.message) {
      foundry.applications.ux.TextEditor.enrichHTML(options.message).then((html) => {
        options.message = html;
      });
    }
    if (options.message) {
      this.message = options.message;
    }
    if (options.context) {
      this.context = options.context;
    }
  }

  /** @override */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    context.message = this.message;
    if (this.context) {
      Object.assign(context, this.context);
    }
    return context;
  }

  /**
   * @returns {void}
   */
  boost() {
    const die = selectWeightedMaxFaceDie(this.dice);
    die._number = die._number + 1;
    this.resetFormula();
  }

  /**
   * @returns {void}
   */
  deboost() {
    const die = selectWeightedMaxFaceDie(this.dice);
    die._number = Math.max(0, die._number - 1);
    this.resetFormula();
  }

  /**
   * @param {number} number - The number of boosts or deboosts to apply. Positive numbers boost, negative numbers deboost.
   * @returns
   */
  setBoost(number) {
    if (number === 0) return;
    const method = number > 0 ? this.boost.bind(this) : this.deboost.bind(this);
    for (let i = 0; i < Math.abs(number); i++) {
      method();
    }
  }
}

/**
 * @param {foundry.dice.terms.DiceTerm[]} diceTerms
 * @returns {foundry.dice.terms.DiceTerm}
 */
function selectWeightedMaxFaceDie(diceTerms) {
  const maxFaces = Math.max(...diceTerms.map((term) => term.faces));
  const maxFaceTerms = diceTerms.filter((term) => term.faces === maxFaces);
  const totalWeight = maxFaceTerms.reduce((sum, term) => sum + term.number, 0);
  let r = Math.random() * totalWeight;
  for (const term of maxFaceTerms) {
    if (r < term.number) return term;
    r -= term.number;
  }
  return maxFaceTerms[maxFaceTerms.length - 1];
}
