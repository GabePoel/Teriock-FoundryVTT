import createDocumentProxy from "./create-proxy.mjs";
import TeriockBaseItem from "./items/base.mjs";
import TeriockEquipment from "./items/equipment.mjs";
import TeriockPower from "./items/power.mjs";
import TeriockRank from "./items/rank.mjs";

const typeMappings = {
  base: TeriockBaseItem,
  equipment: TeriockEquipment,
  power: TeriockPower,
  rank: TeriockRank,
};

const TeriockItemProxy = createDocumentProxy(typeMappings, TeriockBaseItem);
export default TeriockItemProxy;