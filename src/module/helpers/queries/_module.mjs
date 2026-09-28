import createDocumentsQuery from "./create-documents-query.mjs";
import createHotbarFolderQuery from "./create-hotbar-folder-query.mjs";
import deleteDocumentsQuery from "./delete-documents-query.mjs";
import fireTriggerQuery from "./fire-trigger-query.mjs";
import identifyItemQuery from "./identify-item-query.mjs";
import turnChangeQuery from "./turn-change-query.mjs";
import updateDocumentsQuery from "./update-documents-query.mjs";

const queries = {
  "teriock.createDocuments": createDocumentsQuery,
  "teriock.createHotbarFolder": createHotbarFolderQuery,
  "teriock.deleteDocuments": deleteDocumentsQuery,
  "teriock.fireTrigger": fireTriggerQuery,
  "teriock.identifyItem": identifyItemQuery,
  "teriock.turnChange": turnChangeQuery,
  "teriock.updateDocuments": updateDocumentsQuery,
};

export default queries;
