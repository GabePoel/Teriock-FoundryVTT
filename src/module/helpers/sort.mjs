/**
 * Sort conditions.
 * @param {Teriock.Keys.Condition[]} conditions
 */
export function conditionSort(conditions) {
  conditions.sort((a, b) => {
    if (a === "dead") return -1;
    if (b === "dead") return 1;
    if (a === "unconscious") return b === "dead" ? 1 : -1;
    if (b === "unconscious") return a === "dead" ? -1 : 1;
    if (a === "down") return b === "dead" || b === "unconscious" ? 1 : -1;
    if (b === "down") return a === "dead" || a === "unconscious" ? -1 : 1;
    return a.localeCompare(b);
  });
  return conditions;
}

/**
 * Sort documents.
 * @template T
 * @param {T[]} docs
 * @param {object} [options]
 * @param {boolean} [options.alphabetical]
 * @returns {T[]}
 */
export function docSort(docs, options = { alphabetical: true }) {
  return docs.sort((a, b) => {
    if (!options.alphabetical && a.sort !== b.sort) return a.sort - b.sort;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort ranks.
 * @param {TeriockRank[]} ranks
 * @returns {TeriockRank[]}
 */
export function rankSort(ranks) {
  return ranks.sort((a, b) => {
    if (!a.system?.className || !b.system?.className) return a.name.localeCompare(b.name);
    if (a.system.innate !== b.system.innate) return a.system.innate ? -1 : 1;
    if (a.system.archetype === "everyman" && b.system.archetype !== "everyman") return -1;
    if (a.system.archetype !== "everyman" && b.system.archetype === "everyman") return 1;
    if (a.system.className !== b.system.className) return a.system.className.localeCompare(b.system.className);
    if (a.system.classRank !== b.system.classRank) return a.system.classRank - b.system.classRank;
    return a.sort - b.sort;
  });
}

/**
 * Sort abilities.
 * @param {TeriockAbility[]} abilities
 * @returns {TeriockAbility[]}
 */
export function effectSort(abilities) {
  const effectFormOrder = Object.keys(TERIOCK.config.effect.form || {});
  return abilities.sort((a, b) => {
    if (!a.system?.form || !b.system?.form) return a.name.localeCompare(b.name);
    const typeA = a.system?.form || "";
    const typeB = b.system?.form || "";
    const indexA = effectFormOrder.indexOf(typeA);
    const indexB = effectFormOrder.indexOf(typeB);
    if (indexA !== indexB) return indexA - indexB;
    return (a.name || "").localeCompare(b.name || "");
  });
}
