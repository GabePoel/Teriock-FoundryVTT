import { getName } from "../../helpers/utils.mjs";

/**
 * Read a nested property from an object using a dotted notation built from arguments.
 * @param {object} obj
 * @param {...string} pathSegments
 * @returns {unknown}
 */
function path(obj, ...pathSegments) {
  const segments = pathSegments.slice(0, -1);
  const fullPath = segments.join(".");
  return foundry.utils.getProperty(obj, fullPath);
}

export default { getName, path };
