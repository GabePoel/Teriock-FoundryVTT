const MODE_MAP = {
  0: "boost",
  1: "multiply",
  2: "add",
  3: "downgrade",
  4: "upgrade",
  5: "override",
};

/**
 * Migrate all parts of a qualified change from V13 to V14.
 * @param {object} change
 * @returns {Teriock.Changes.QualifiedChangeData}
 */
export function v14MigrateChange(change) {
  v14MigrateChangeProperties(change);
  change.type = v14MigrateChangeMode(change.type);
  change.key = v14MigrateChangeKey(change.key);
  change.value = v14MigrateChangeValue(change.value);
}

/**
 * Migrate change modes from V13 to V14.
 * @param {string|number} type
 */
export function v14MigrateChangeMode(type) {
  if (MODE_MAP[type]) return MODE_MAP[type];
  return type;
}

/**
 * Migrate change keys from V13 to V14.
 * @param {string} key
 * @return {string}
 */
export function v14MigrateChangeKey(key) {
  key = _v14MigrateChangeKeyLight(key);
  return key;
}

/**
 * Migrate change values from V13 to V14.
 * @param {string} value
 * @return {string}
 */
export function v14MigrateChangeValue(value) {
  value = _v14MigrateChangeValueInfinity(value);
  return value;
}

/**
 * Migrate change property names from V13 to V14.
 * @param {object} change
 * @return {Teriock.Changes.QualifiedChangeData}
 */
export function v14MigrateChangeProperties(change) {
  if (change.mode) change.type = change.mode;
  delete change.mode;
  if (change.time) change.phase = change.time;
  delete change.time;
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

/**
 * Migrate references to infinity.
 * @param {string} value
 * @return {string}
 */
function _v14MigrateChangeValueInfinity(value) {
  return value.replaceAll("Infinity", "@inf");
}
