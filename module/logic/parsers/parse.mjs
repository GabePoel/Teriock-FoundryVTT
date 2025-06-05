import parseAbility from "./instances/ability.mjs";
import parseEquipment from "./instances/equipment.mjs";
import parseRank from "./instances/rank.mjs";

export default async function parse(rawHTML, document) {
  console.log(document.type);
  if (document.type === 'ability') {
    return parseAbility(rawHTML, document);
  } else if (document.type === 'equipment') {
    return parseEquipment(rawHTML, document);
  } else if (document.type === 'rank') {
    return await parseRank(rawHTML, document);
  } else {
    throw new Error(`Unknown type: ${document.type}`);
  }
}