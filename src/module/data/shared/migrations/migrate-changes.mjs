import { comparisons } from "../../../dice/functions/_module.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";

/**
 * Turn a change into a qualified change.
 * @param {Teriock.Foundry.EffectChangeData | Teriock.Changes.QualifiedChangeData} change
 * @returns {Teriock.Changes.QualifiedChangeData}
 */
export function qualifyChange(change) {
  let { target = "Actor", qualifier = "1", key } = change;
  if (key.startsWith("item")) {
    target = "Item";
    key = key.slice(4);
  } else if (key.startsWith("!")) {
    const parts = key.split("__");
    target = parts[0].slice(1);
    key = parts.slice(1).join("__");
  }
  if (key.includes("__")) {
    const parts = key.split("__");
    let path = parts[0];
    let op = parts[1];
    let ref = parts[2];
    if (Object.keys(pathTransformations).includes(path)) {
      const terms = { path, ref, op };
      const newTerms = pathTransformations[path](terms);
      path = newTerms.path || path;
      ref = newTerms.ref || ref;
      op = newTerms.op || op;
    }
    key = parts.slice(3).join("");
    if (Object.keys(comparisons).includes(op)) {
      qualifier = `${op}(@${path}, ${ref})`;
    } else {
      switch (op) {
        case "has":
          qualifier = `@${path}.${ref}`;
          break;
        case "includes":
          qualifier = `@${path}.${ref}`;
          break;
        case "exists":
          qualifier = `@${path}`;
          break;
        case "is":
          qualifier = `@${path}`;
          break;
        case "isNot":
          qualifier = `not(@${path})`;
          break;
      }
    }
  }
  return /** @type {Teriock.Changes.QualifiedChangeData} */ {
    mode: change.mode,
    priority: change.priority,
    time: change.time || "normal",
    key,
    target,
    qualifier,
    value: change.value,
  };
}

const pathTransformations = {
  "effectKeys.property": () => {
    return { path: "prop" };
  },
  name: (terms) => {
    return {
      op: "has",
      ref: toCamelCase(terms.ref),
      path: "key",
    };
  },
  "parent.system.className": (terms) => {
    return {
      op: "has",
      ref: terms.ref.slice(0, 3).toLowerCase(),
      path: "class",
    };
  },
  "system.av.saved": () => {
    return {
      op: "exists",
      path: "av",
    };
  },
  "system.damage.base.raw": () => {
    return { path: "dmg" };
  },
  "system.damage.twoHanded.raw": () => {
    return { path: "dmg.2h" };
  },
  "system.elderSorcery": () => {
    return { path: "es" };
  },
  "system.elements": (terms) => {
    return {
      path: "element",
      ref: terms.ref.slice(0, 3).toLowerCase(),
    };
  },
  "system.equipmentClasses": () => {
    return {
      path: "class",
    };
  },
  "system.equipmentType": (terms) => {
    return {
      op: "has",
      path: "type",
      ref: toCamelCase(terms.ref),
    };
  },
  "system.interaction": () => {
    return {
      op: "has",
      path: "interaction",
    };
  },
  type: () => {
    return {
      op: "none",
    };
  },
};
