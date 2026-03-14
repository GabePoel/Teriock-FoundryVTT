const MODE_MAP = {
  0: "boost",
  1: "multiply",
  2: "add",
  3: "downgrade",
  4: "upgrade",
  5: "override",
};

/**
 *
 * @param {string|number} mode
 */
export function v14MigrateChangeMode(mode) {
  if (MODE_MAP[mode]) return MODE_MAP[mode];
  return mode;
}
