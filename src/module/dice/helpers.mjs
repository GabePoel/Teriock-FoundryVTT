/**
 * Select one of the dice terms with the highest number of faces, weighted based on number.
 * @param {DiceTerm[]} diceTerms
 * @returns {DiceTerm}
 */
export function selectWeightedMaxFaceDie(diceTerms) {
  const maxFaces = Math.max(
    ...diceTerms.filter((term) => term.number > 0).map((term) => term.faces),
  );
  const maxFaceTerms = diceTerms.filter((term) => term.faces === maxFaces);
  const totalWeight = maxFaceTerms.reduce((sum, term) => sum + term.number, 0);
  let r = Math.random() * totalWeight;
  for (const term of maxFaceTerms) {
    if (r < term.number) {
      return term;
    }
    r -= term.number;
  }
  return (
    maxFaceTerms[maxFaceTerms.length - 1] || diceTerms[diceTerms.length - 1]
  );
}
