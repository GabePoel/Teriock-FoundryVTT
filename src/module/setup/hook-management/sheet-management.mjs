import { bindCommonActions } from "../../applications/shared/_module.mjs";

export default function registerSheetManagementHooks() {
  foundry.helpers.Hooks.on(
    "renderJournalEntrySheet",
    /**
     * @param {ApplicationV2} _application
     * @param {HTMLElement} element
     */
    (_application, element) => {
      bindCommonActions(element);
    },
  );
}
