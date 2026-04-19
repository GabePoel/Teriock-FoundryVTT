import registerSheetManagementHooks from "./sheet-hooks.mjs";
import registerTimeManagementHooks from "./time-hooks.mjs";
import registerTokenManagementHooks from "./token-hooks.mjs";

export function registerHooks() {
  registerTimeManagementHooks();
  registerTokenManagementHooks();
  registerSheetManagementHooks();
}
