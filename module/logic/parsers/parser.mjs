import parseEquipment from "./instances/equipment.mjs";
import parseRank from "./instances/rank.mjs";

export default async function parse(document, rawHTML) {
  if (document.type === 'equipment') {
    return parseEquipment(rawHTML, document);
  }
  if (document.type === 'rank') {
    return await parseRank(rawHTML, document);
  }
  throw new Error(`Unknown type: ${document.type}`);
}