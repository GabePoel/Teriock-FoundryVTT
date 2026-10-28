import createHotbarFolderQuery from "./create-hotbar-folder-query.mjs";
import fireTriggerQuery from "./fire-trigger-query.mjs";
import identifyItemQuery from "./identify-item-query.mjs";
import modifyBatchQuery from "./modify-batch-query.mjs";
import turnChangeQuery from "./turn-change-query.mjs";

const queries = {
  "teriock.createHotbarFolder": createHotbarFolderQuery,
  "teriock.fireTrigger": fireTriggerQuery,
  "teriock.identifyItem": identifyItemQuery,
  "teriock.modifyBatch": modifyBatchQuery,
  "teriock.turnChange": turnChangeQuery,
};

export default queries;
