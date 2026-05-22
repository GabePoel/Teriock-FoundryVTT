/**
 * Migrate a change type.
 * @param {object} change
 * @param {string} [dst]
 */
export function migrateChangeType(change, dst = "type") {
  if (typeof change.mode === "number" && typeof change[dst] !== "string") {
    if (change.mode === 0) change[dst] = "boost";
    if (change.mode === 1) change[dst] = "multiply";
    if (change.mode === 2) change[dst] = "add";
    if (change.mode === 3) change[dst] = "downgrade";
    if (change.mode === 4) change[dst] = "upgrade";
    if (change.mode === 5) change[dst] = "override";
  }
  delete change.mode;
}

/**
 * Migrate a qualified change.
 * @param {object} change
 */
export function migrateChange(change) {
  if (change.time && !change.phase) change.phase = change.time;
  delete change.time;
  migrateChangeType(change);
  if (change.key && change.key.startsWith("system.light"))
    change.key = change.key.replace("system.light", "token.light");
}
