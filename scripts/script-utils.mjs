/**
 * A simple object with its keys sorted. Has minimal array support.
 * @param {object} obj
 * @returns {object}
 */
export function sortObject(obj) {
  if (typeof obj !== "object") { return obj; }
  if (Array.isArray(obj)) {
    if (obj.length) {
      if (typeof obj[0] === "string") {
        obj.sort((a, b) => a.localeCompare(b));
      } else if (typeof obj[0] === "object") {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = sortObject(obj[i]);
        }
      }
    }
    return obj;
  }
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortObject(obj[key]);
    return acc;
  }, {});
}

export const FOUNDRY_ROOT = "systems/teriock/src/icons/hold";
