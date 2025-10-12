import { transplantOverrides } from "../helpers/transplant.mjs";

const { FunctionTerm } = foundry.dice.terms;

/**
 * Subclassed to allow for boosting and deboosting. Foundry relies on the original  class. So, the overwritten
 * methods on this subclass need to be transplanted into the original class in order to work.
 *
 * Relevant wiki pages:
 * - [Boosted](https://wiki.teriock.com/index.php/Keyword:Boosted)
 * - [Deboosted](https://wiki.teriock.com/index.php/Keyword:Deboosted)
 *
 * @inheritDoc
 */
class BoosterTerm extends FunctionTerm {
  static BOOST_ALIASES = {
    b: "boost",
    db: "deboost",
    sb: "setboost",
    boost: "boost",
    deboost: "deboost",
    setboost: "setboost",
  };

  static get BOOST_FUNCTIONS() {
    return {
      boost: this._boost,
      deboost: this._deboost,
      setboost: this._setboost,
    };
  }

  /**
   * Boost the roll.
   * @param {TeriockRoll} roll
   * @private
   */
  static _boost(roll) {
    const die = selectWeightedMaxFaceDie(roll.dice);
    die._number += 1;
    roll.resetFormula();
  }

  /**
   * Deboost the roll.
   * @param {TeriockRoll} roll
   * @private
   */
  static _deboost(roll) {
    const die = selectWeightedMaxFaceDie(roll.dice);
    die._number = Math.max(0, die._number - 1);
    roll.resetFormula();
  }

  /**
   * Apply some number of boosts or deboosts. Positive for boosts. Negative for deboosts.
   * @param {TeriockRoll} roll
   * @param {number} number
   * @private
   */
  static _setboost(roll, number) {
    if (number > 0) {
      for (let i = 0; i < number; i++) {
        this._boost(roll);
      }
    } else if (number < 0) {
      for (let i = 0; i < Math.abs(number); i++) {
        this._deboost(roll);
      }
    }
  }

  /** @inheritDoc */
  get function() {
    if (this.isBooster) {
      return (n) => n;
    }
    return super.function;
  }

  /** @inheritDoc */
  get isBooster() {
    return Object.prototype.hasOwnProperty.call(
      this.constructor.BOOST_ALIASES,
      this.fn,
    );
  }

  /** @inheritDoc */
  get isDeterministic() {
    return this.isBooster ? false : super.isDeterministic;
  }

  /** @inheritDoc */
  async _evaluateAsync(options = {}) {
    let removedRoll;
    if (this.isBooster) {
      const boostFunction = this.constructor.BOOST_ALIASES[this.fn];
      if (boostFunction === "setboost") {
        await this.rolls[1].evaluate();
        const number = this.rolls[1].total;
        removedRoll = this.rolls.splice(1, 1)[0];
        this.constructor._setboost(this.rolls[0], number);
      } else {
        this.constructor.BOOST_FUNCTIONS[boostFunction]?.(this.rolls[0]);
      }
    }
    const result = await super._evaluateAsync(options);
    if (removedRoll) {
      this.rolls.splice(1, 0, removedRoll);
    }
    return result;
  }
}

const members = ["function", "isDeterministic", "_evaluateAsync", "isBooster"];
const staticMembers = [
  "BOOST_ALIASES",
  "BOOST_FUNCTIONS",
  "_boost",
  "_deboost",
  "_setboost",
];

/**
 * Select one of the dice terms with the highest number of faces, weighted based on number.
 * @param {DiceTerm[]} diceTerms
 * @returns {DiceTerm}
 */
function selectWeightedMaxFaceDie(diceTerms) {
  const maxFaces = Math.max(...diceTerms.map((term) => term.faces));
  const maxFaceTerms = diceTerms.filter((term) => term.faces === maxFaces);
  const totalWeight = maxFaceTerms.reduce((sum, term) => sum + term.number, 0);
  let r = Math.random() * totalWeight;
  for (const term of maxFaceTerms) {
    if (r < term.number) {
      return term;
    }
    r -= term.number;
  }
  return maxFaceTerms[maxFaceTerms.length - 1];
}

transplantOverrides(FunctionTerm, BoosterTerm, members, {
  statics: staticMembers,
});

export default FunctionTerm;
