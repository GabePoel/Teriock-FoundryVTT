const MODE_MAP = {
  0: "boost",
  1: "multiply",
  2: "add",
  3: "downgrade",
  4: "upgrade",
  5: "override",
};

/**
 * Migrate change modes from V13 to V14.
 * @param {string|number} mode
 */
export function v14MigrateChangeMode(mode) {
  if (MODE_MAP[mode]) return MODE_MAP[mode];
  return mode;
}

/**
 * Migrate change keys from V13 to V14.
 * @param key
 * @return {string | string}
 */
export function v14MigrateChangeKey(key) {
  key = _v14MigrateChangeKeyLight(key);
  return key;
}

/**
 * Migrate actor light overrides to apply to tokens.
 * @param {string} key
 */
function _v14MigrateChangeKeyLight(key) {
  if (key.startsWith("system.light")) {
    return key.replace("system", "tokenOverrides");
  }
  return key;
}
