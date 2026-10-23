/**
 * @import { BaseRoll } from "./rolls/_module.mjs";
 * @import { DiceTerm, NumericTerm } from "@client/dice/terms/_module.mjs";
 */

/**
 * The boost priority to give the next die a boost adds to. Boosts are prioritized from the highest priority down.
 * @param {BaseRoll} roll
 * @returns {number}
 */
function nextBoostPriority(roll) {
  const priorities = [...roll.dice, ...roll.numbers].map(term => term.options.boostPriority).filter(p =>
    typeof p === "number"
  );
  return priorities.length ? Math.max(...priorities) + 1 : 0;
}

/**
 * Select one of some dice terms weighted based on number.
 * @param {DiceTerm[]} terms
 * @returns {DiceTerm|null}
 */
function selectWeightedDie(terms) {
  if (!terms.length) { return null; }
  const totalWeight = terms.reduce((sum, term) => sum + term.number, 0);
  let r = Math.random() * totalWeight;
  for (const term of terms) {
    if (r < term.number) { return term; }
    r -= term.number;
  }
  return terms[terms.length - 1];
}

/**
 * Add a single die of the largest size with the types of all the tied dice.
 *
 * Relevant wiki pages:
 * - [Boosted](https://wiki.teriock.com/index.php?title=Keyword:Boosted)
 *
 * @param {BaseRoll} roll
 * @returns {DiceTerm|null}
 */
export function addCombinedMaxFaceDie(roll) {
  if (game.settings.get("teriock", "randomBoostedTypes")) { return null; }
  const terms = maxFaceDice(roll);
  if (terms.length < 2) { return null; }
  const types = new Set(terms.flatMap(term => term.flavor.split(" ")).filter(Boolean));
  const flavor = Array.from(types).join(" ");
  const existing = terms.find(term => term.flavor === flavor);
  if (existing) {
    existing.number += 1;
    markBoostedDie(roll, existing);
    return existing;
  }
  const options = { boostPriority: nextBoostPriority(roll), flavor };
  const die = terms[0] instanceof foundry.dice.terms.NumericTerm
    ? new foundry.dice.terms.NumericTerm({ number: 1, options })
    : new foundry.dice.terms.Die({ faces: terms[0].faces, number: 1, options });
  roll.terms.push(new foundry.dice.terms.OperatorTerm({ operator: "+" }), die);
  return die;
}

/**
 * Mark a die as the one a boost most recently added to.
 * @param {BaseRoll} roll
 * @param {DiceTerm} die
 */
export function markBoostedDie(roll, die) {
  die.options.boostPriority = nextBoostPriority(roll);
}

/**
 * The nonzero dice terms tied for the highest number of faces. Numerical boosts and deboosts can be treated as d1s if
 * the settings are set appropriately.
 * @param {BaseRoll} roll
 * @returns {(DiceTerm|NumericTerm)[]}
 */
function maxFaceDice(roll) {
  const dice = roll.dice.filter(d => d.number !== 0);
  if (!dice.length && game.settings.get("teriock", "numericalBoostsAndDeboosts")) {
    return roll.numbers.filter(t => t.number !== 0);
  }
  const maxFaces = Math.max(...dice.map(d => d.faces));
  return dice.filter(d => d.faces === maxFaces);
}

/**
 * Select the die a deboost should remove. This is the most recently boosted of
 * the largest dice and falls back on a weighted selection when none of them were boosted.
 *
 * Relevant wiki pages:
 * - [Deboosted](https://wiki.teriock.com/index.php?title=Keyword:Deboosted)
 *
 * @param {BaseRoll} roll
 * @returns {DiceTerm}
 */
export function selectDeboostDie(roll) {
  const terms = maxFaceDice(roll);
  const priority = Math.max(-1, ...terms.map(term => term.options.boostPriority ?? -1));
  const boosted = priority < 0 ? [] : terms.filter(term => term.options.boostPriority === priority);
  const die = selectWeightedDie(boosted) ?? selectWeightedMaxFaceDie(roll);
  if (die) { delete die.options.boostPriority; }
  return die;
}

/**
 * Select one of the dice terms with the highest number of faces weighted based on number. When everything has been
 * deboosted away, this falls back on the largest die, or on a number with numerical boosts and deboosts.
 * @param {BaseRoll} roll
 * @returns {DiceTerm|NumericTerm|undefined}
 */
export function selectWeightedMaxFaceDie(roll) {
  return selectWeightedDie(maxFaceDice(roll)) ?? roll.dice.toSorted((a, b) => b.faces - a.faces)[0]
    ?? (game.settings.get("teriock", "numericalBoostsAndDeboosts") ? roll.numbers.at(-1) : undefined);
}
