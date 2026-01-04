/**
 * Migrate piercing data.
 * @param {object} data
 * @returns {object}
 */
export function migratePiercing(data) {
  if (typeof data !== "object") {
    data = {};
  }
  if (typeof data.piercing === "string") {
    if (data.piercing === "av0") data.piercing = { raw: 1 };
    if (data.piercing === "ub") data.piercing = { raw: 2 };
  }
  if (typeof data.piercing !== "object") {
    data.piercing = {};
  }
  return data;
}
