/**
 * Migrate the hierarchy of some {@link TeriockActiveEffect}'s system data.
 * @param {object} data - The data to migrate.
 */
export function migrateHierarchy(data) {
  if (typeof data.rootUuid === "string") {
    if (typeof data.hierarchy !== "object") {
      data.hierarchy = {};
    }
    data.hierarchy.rootUuid = data.rootUuid;
  }
  if (Array.isArray(data.subIds)) {
    if (typeof data.hierarchy !== "object") {
      data.hierarchy = {};
    }
    data.hierarchy.subIds = data.subIds;
  }
  if (typeof data.supId === "string") {
    if (typeof data.hierarchy !== "object") {
      data.hierarchy = {};
    }
    data.hierarchy.supId = data.supId;
  }
  return data;
}
