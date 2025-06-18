/** @import TeriockAbilityData from "../ability-data.mjs"; */

/**
 * @param {object} data
 * @returns {Partial<TeriockAbilityData>}
 */
export function _migrateData(data) {
  if (data.effects) {
    data.effects.sort();
  }
  if (data.effects?.includes("truth")) {
    data.effects = data.effects.map(effect => effect === "truth" ? "truthDetecting" : effect);
  }
  if (data.effects?.includes("duelMod")) {
    data.effects = data.effects.map(effect => effect === "duelMod" ? "duelModifying" : effect);
  }
  if (data.costs?.mp) {
    if (typeof data.costs?.mp === "string" || typeof data.costs?.mp === "number" || data.costs?.mp === null) {
      const mp = {
        variable: (data.costs?.mp === 'x') ? true : false,
        value: (data.costs?.mp === 'x') ? 0 : Number(data.costs?.mp) || 0,
        description: data.costs.manaCost || "",
      }
      data.costs.mp = mp;
      delete data.costs.manaCost;
    }
    if (typeof data.costs.mp.value === "number") {
      const mp = {
        type: "none",
        value: {
          static: 0,
          formula: "",
          variable: "",
        }
      }
      if (data.costs.mp.variable) {
        mp.type = "variable";
        mp.value.variable = data.costs.mp.description || "";
        mp.static = 0;
      } else if (data.costs.mp.value > 0) {
        mp.type = "static";
        mp.value.static = data.costs.mp.value;
        mp.value.formula = "";
        mp.value.variable = "";
      }
      data.costs.mp = mp;
    }
  }
  if (data.costs?.hp) {
    if (typeof data.costs?.hp === "string" || typeof data.costs?.hp === "number" || data.costs?.hp === null) {
      const hp = {
        variable: (data.costs?.hp === 'x') ? true : false,
        value: (data.costs?.hp === 'x') ? 0 : Number(data.costs?.hp) || 0,
        description: data.costs.hitCost || "",
      }
      data.costs.hp = hp;
      delete data.costs.hitCost;
    }
    if (typeof data.costs.hp.value === "number") {
      const hp = {
        type: "none",
        value: {
          static: 0,
          formula: "",
          variable: "",
        }
      }
      if (data.costs.hp.variable) {
        hp.type = "variable";
        hp.value.variable = data.costs.hp.description || "";
        hp.static = 0;
      } else if (data.costs.hp.value > 0) {
        hp.type = "static";
        hp.value.static = data.costs.hp.value;
        hp.value.formula = "";
        hp.value.variable = "";
      }
      data.costs.hp = hp;
    }
  }
  return data;
}