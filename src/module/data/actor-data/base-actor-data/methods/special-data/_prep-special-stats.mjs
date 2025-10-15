import { docSort } from "../../../../../helpers/utils.mjs";

/**
 * Prepare stats and stat dice.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepSpecialStats(actorData) {
  const diceLimit = Math.floor(actorData.scaling.lvl / 5);
  let numRanks = 0;
  const diceStats = ["hp", "mp"];
  actorData.sheet.dieBox = {};
  const statItems = [
    ...docSort(actorData.parent.species),
    ...docSort(actorData.parent.ranks),
    ...docSort(actorData.parent.mounts),
  ];
  for (const stat of diceStats) {
    actorData[stat].base = 0;
    actorData.sheet.dieBox[stat] = "";
    for (const item of statItems) {
      if (item.type !== "rank" || numRanks < diceLimit) {
        if (!item.system.statDice[stat].disabled) {
          actorData[stat].base += item.system.statDice[stat].value;
          actorData.sheet.dieBox[stat] += item.system.statDice[stat].html;
        }
      }
      if (item.type === "rank" && !item.system.innate) {
        numRanks += 1;
      }
    }
    actorData[stat].max = Math.max(1, actorData[stat].base);
    actorData[stat].min = -Math.floor(actorData[stat].max / 2);
    actorData[stat].max -= actorData[stat].morganti;
    actorData[stat].value = Math.min(
      Math.max(actorData[stat].value, actorData[stat].min),
      actorData[stat].max,
    );
    actorData[stat].temp = Math.max(0, actorData[stat].temp);
  }
}
