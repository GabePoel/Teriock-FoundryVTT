import registerChatManagementHooks from "./chat-management.mjs";
import registerSheetManagementHooks from "./sheet-management.mjs";
import registerTimeManagementHooks from "./time-management.mjs";
import registerTokenManagementHooks from "./token-management.mjs";

export function registerHooks() {
  registerChatManagementHooks();
  registerTimeManagementHooks();
  registerTokenManagementHooks();
  registerSheetManagementHooks();
}
