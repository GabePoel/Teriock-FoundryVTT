import { addCombinedMaxFaceDie, markBoostedDie, selectDeboostDie, selectWeightedMaxFaceDie } from "./helpers.mjs";

/**
 * @import { Roll } from "@client/dice/_module.mjs";
 * @import { DiceTerm, NumericTerm } from "@client/dice/terms/_module.mjs";
 */

const { FunctionTerm } = foundry.dice.terms;

/**
 * Subclassed to allow for boosting and deboosting. Foundry relies on the original class. So, the overwritten
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
    boost: "boost",
    db: "deboost",
    deboost: "deboost",
    sb: "setboost",
    setboost: "setboost",
  };

  /**
   * Boost the roll.
   * @param {BaseRoll} roll
   * @returns {DiceTerm|NumericTerm|undefined} The boosted term.
   */
  static _boost(roll) {
    let die = addCombinedMaxFaceDie(roll);
    if (!die) {
      die = selectWeightedMaxFaceDie(roll);
      if (die) {
        die.number += 1;
        markBoostedDie(roll, die);
      }
    }
    roll.resetFormula();
    return die;
  }

  /**
   * Deboost the roll.
   * @param {BaseRoll} roll
   * @returns {DiceTerm|NumericTerm|undefined} The deboosted term.
   */
  static _deboost(roll) {
    const die = selectDeboostDie(roll);
    if (die) { die.number = Math.max(0, die.number - 1); }
    roll.resetFormula();
    return die;
  }

  /**
   * Apply some number of boosts or deboosts. Positive for boosts. Negative for deboosts.
   * @param {BaseRoll} roll
   * @param {number} number
   */
  static _setboost(roll, number) {
    for (let i = 0; i < Math.abs(number); i++) {
      if (number > 0) { this._boost(roll); }
      else { this._deboost(roll); }
    }
  }

  /**
   * The boost counts and the number and faces of the boosted dice. These are the unevaluated rolls this term and the
   * boosters within it need before their boosts can apply.
   * @returns {Roll[]}
   */
  get _boostInputs() {
    if (!this.isBooster || !this.rolls[0]) { return []; }
    const rolls = new Set([
      ...this.rolls.slice(1),
      ...this.rolls[0].dice.flatMap(d => [d._number, d._faces]),
      ...this.rolls[0].terms.flatMap(t => t._boostInputs ?? []),
    ]);
    return Array.from(rolls).filter(r => r instanceof foundry.dice.Roll && !r._evaluated);
  }

  /** @inheritDoc */
  get dice() {
    return this.isBooster ? (this.rolls[0]?.dice ?? []) : super.dice;
  }

  /** @inheritDoc */
  get function() {
    if (this.isBooster) { return n => n; }
    return super.function;
  }

  /** @inheritDoc */
  get isBooster() {
    return Object.prototype.hasOwnProperty.call(this.constructor.BOOST_ALIASES, this.fn);
  }

  /** @inheritDoc */
  get isDeterministic() {
    return this.isBooster ? false : super.isDeterministic;
  }

  /**
   * The numeric terms of the boosted formula.
   * @returns {NumericTerm[]}
   */
  get numbers() {
    return this.isBooster ? (this.rolls[0]?.numbers ?? []) : [];
  }

  /**
   * Apply the boosts of this term once. Boosts nested within the boosted formula apply first. The rolls from
   * {@link _boostInputs} must already be evaluated.
   */
  _applyBoosts() {
    if (this._boostsApplied || !this.rolls[0]) { return; }
    this._boostsApplied = true;
    // Dice evaluate their own number and faces. Evaluated rolls are switcherood for their totals.
    for (const die of this.rolls[0].dice) {
      if (die._number instanceof foundry.dice.Roll) { die._number = die._number.total; }
      if (die._faces instanceof foundry.dice.Roll) { die._faces = die._faces.total; }
    }
    for (const term of this.rolls[0].terms) { if (term.isBooster) { term._applyBoosts(); } }
    this.rolls[0].collapseNumbers();
    const number = { boost: 1, deboost: -1 }[this.constructor.BOOST_ALIASES[this.fn]] ?? this.rolls[1]?.total ?? 0;
    this.constructor._setboost(this.rolls[0], number);
  }

  /** @inheritDoc */
  async _evaluateAsync(options = {}) {
    if (!this.isBooster) { return super._evaluateAsync(options); }
    await Promise.all(this._boostInputs.map(r => r.evaluate(options)));
    this._applyBoosts();
    const counts = this.rolls.splice(1);
    const result = await super._evaluateAsync(options);
    this.rolls.push(...counts);
    return result;
  }

  /** @inheritDoc */
  _evaluateSync(options = {}) {
    if (!this.isBooster) { return super._evaluateSync(options); }
    for (const roll of this._boostInputs) { roll.evaluateSync(options); }
    this._applyBoosts();
    const counts = this.rolls.splice(1);
    const result = super._evaluateSync(options);
    this.rolls.push(...counts);
    return result;
  }
}

const members = [
  "_applyBoosts",
  "_boostInputs",
  "_evaluateAsync",
  "_evaluateSync",
  "dice",
  "function",
  "isBooster",
  "isDeterministic",
  "numbers",
];
const staticMembers = ["BOOST_ALIASES", "_boost", "_deboost", "_setboost"];

// Monkey patch BoosterTerm stuff onto FunctionTerm.
/** @param {PropertyDescriptor} d */
const redefinable = d => ({ ...d, configurable: true, enumerable: false });
const copyMembers = (src, dst, keys) => {
  for (const name of keys) {
    const d = Object.getOwnPropertyDescriptor(src, name);
    if (d) { Object.defineProperty(dst, name, redefinable(d)); }
  }
};
const original = Object.create(Object.getPrototypeOf(FunctionTerm.prototype));
copyMembers(FunctionTerm.prototype, original, members);
Object.setPrototypeOf(BoosterTerm.prototype, original);
copyMembers(BoosterTerm.prototype, FunctionTerm.prototype, members);
copyMembers(BoosterTerm, FunctionTerm, staticMembers);

export default FunctionTerm;
