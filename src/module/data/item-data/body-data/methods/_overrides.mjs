const bodyMap = {
  Stinger: {
    "damage.base.saved": "1d4",
    "damage.types": ["toxic"],
  },
};

/**
 * @param {TeriockBodyModel} bodyData - The equipment data to apply overrides to.
 * @param {Partial<TeriockBodyModel>} parameters - The parameters to override.
 * @returns {Partial<TeriockBodyModel>} The parameters with overrides applied.
 * @private
 */
export function _override(bodyData, parameters) {
  if (bodyMap[bodyData.parent.name]) {
    const map = bodyMap[bodyData.parent.name];
    for (const [key, value] of Object.entries(map)) {
      foundry.utils.setProperty(parameters, key, value);
    }
  }
  return parameters;
}
