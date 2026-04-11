/**
 * Migrate a qualified change.
 * @param {object} change
 */
export function migrateChange(change) {
  if (change.time) {
    change.time = change.phase;
    delete change.time;
  }
  if (foundry.utils.hasProperty(change, "mode")) {
    if (change.mode === 0) change.type = "boost";
    if (change.mode === 1) change.type = "multiply";
    if (change.mode === 2) change.type = "add";
    if (change.mode === 3) change.type = "downgrade";
    if (change.mode === 4) change.type = "upgrade";
    if (change.mode === 5) change.type = "override";
    delete change.mode;
  }
  if (change.key && change.key.startsWith("system.light")) {
    change.key = change.key.replace("system.light", "token.light");
  }
}
