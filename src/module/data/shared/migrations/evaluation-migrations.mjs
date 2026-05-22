/**
 * Migrate an evaluation to a number.
 * @param {object} data
 * @param {string} evaluationPath
 * @param {object} [options]
 * @param {number|null} [options.fallback]
 */
export function migrateEvaluationToNumber(data, evaluationPath, options = {}) {
  if (!foundry.utils.hasProperty(data, evaluationPath)) return;
  if (typeof foundry.utils.getProperty(data, evaluationPath) === "number") return;
  if (foundry.utils.getProperty(data, evaluationPath) === null) return options.fallback ?? 0;
  if (typeof foundry.utils.getProperty(data, evaluationPath) === "object") {
    let n;
    const raw = foundry.utils.getProperty(data, `${evaluationPath}.raw`);
    if (typeof raw === "string") n = Number(raw);
    if (!Number.isNumeric(n)) n = options.fallback ?? 0;
    foundry.utils.setProperty(data, evaluationPath, n);
  }
}
