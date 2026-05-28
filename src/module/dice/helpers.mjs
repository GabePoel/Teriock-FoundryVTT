/**
 * Select one of the dice terms with the highest number of faces, weighted based on number.
 * @param {BaseRoll} roll
 * @returns {DiceTerm}
 */
export function selectWeightedMaxFaceDie(roll) {
  const diceTerms = roll.terms.filter(t => t instanceof foundry.dice.terms.DiceTerm);
  if (!diceTerms.length) { diceTerms.push(...roll.dice); }
  const maxFaces = Math.max(...diceTerms.filter(term => term.number > 0).map(term => term.faces));
  const maxFaceTerms = diceTerms.filter(term => term.faces === maxFaces);
  const totalWeight = maxFaceTerms.reduce((sum, term) => sum + term.number, 0);
  let r = Math.random() * totalWeight;
  for (const term of maxFaceTerms) {
    if (r < term.number) { return term; }
    r -= term.number;
  }
  return maxFaceTerms[maxFaceTerms.length - 1] || diceTerms[diceTerms.length - 1];
}
