import TeriockRoll from "./roll.mjs";

// TODO: Reimplement pulling with RollTerm.
// TODO: Custom template for Death Bag.

/**
 * The Death Bag.
 *
 * Relevant wiki pages:
 * - [Dead](https://wiki.teriock.com/index.php/Condition:Dead)
 *
 * @example
 * ```
 *   /roll pull(10, 10[white] + 10[black])
 *   /roll pull(1d6, 10d10[white] + 5d20[black])
 *  ```
 */
export default class DeathBag extends TeriockRoll {
  /** @inheritDoc */
  static CHAT_TEMPLATE = "systems/teriock/src/templates/document-templates/roll-templates/death-bag.hbs";

  /**
   * Convert a pull result to a plain dice-style formula.
   * @param {object} pullResult - The pull result.
   * @returns {string} Formula like "3[white] + 2[black]".
   */
  static #createPullResultFormula(pullResult) {
    if (!pullResult) {
      return "0";
    }
    const terms = [];
    for (const [ color, count ] of Object.entries(pullResult.pullCounts)) {
      terms.push(`${count}[${color}]`);
    }
    return terms.length ? terms.join(" + ") : "0[empty]";
  }

  /**
   * Perform a pull without replacement from a bag of stones.
   * @param {object} params
   * @param {number} params.pullCount - Number of stones requested.
   * @param {Teriock.RollOptions.BagComposition[]} params.bag - Bag composition.
   * @param {TeriockRoll} params.bagRoll - The evaluated bag roll.
   * @returns {object} Pull result with requested, actual, pulled stones, and metadata.
   */
  static #executePull({
    pullCount,
    bag,
    bagRoll,
  }) {
    const all = [];
    for (const s of bag) {
      for (let i = 0; i < s.count; i++) {
        all.push(s.color);
      }
    }

    if (pullCount > all.length) {
      console.warn(
        `Attempting to pull ${pullCount} stones from a bag with only ${all.length} stones. Bag composition:`,
        bag,
      );
    }

    const remaining = [ ...all ];
    const pulled = [];
    const actual = Math.min(pullCount, all.length);

    for (let i = 0; i < actual; i++) {
      const idx = Math.floor(Math.random() * remaining.length);
      pulled.push(remaining[idx]);
      remaining.splice(idx, 1);
    }

    const pullCounts = {};
    for (const c of pulled) {
      pullCounts[c] = (pullCounts[c] || 0) + 1;
    }

    return {
      actualPulled: actual,
      bagComposition: bag,
      bagFormula: bagRoll.formula,
      bagRollDetails: bagRoll._formula,
      bagTotal: bagRoll.total,
      pullCounts,
      pulledStones: pulled,
      remaining: remaining.length,
      requested: pullCount,
      totalInBag: all.length,
    };
  }

  /**
   * Extract the inner content of a function call, handling nested parentheses.
   * @param {string} functionCall - String starting with a function name and parentheses.
   * @returns {string} Content inside the outermost parentheses.
   */
  static #extractFunctionContent(functionCall) {
    const open = functionCall.indexOf("(");
    if (open === -1) {
      throw new Error("Invalid function call: missing opening parenthesis");
    }

    let depth = 0;
    const start = open + 1;
    for (let i = start; i < functionCall.length; i++) {
      const ch = functionCall[i];
      if (ch === "(") {
        depth++;
      } else if (ch === ")") {
        if (depth === 0) {
          return functionCall.substring(start, i);
        }
        depth--;
      }
    }
    throw new Error("Invalid function call: missing closing parenthesis");
  }

  /**
   * Walk an evaluated bag roll and collect stones by flavor.
   * @param {TeriockRoll} roll - The evaluated roll.
   * @returns {Array<{color: string, count: number, originalTerm: string}>}
   */
  static #extractStonesFromRoll(roll) {
    const stones = [];
    const Terms = foundry?.dice?.terms ?? {};

    const isDice = (t) => t
      instanceof Terms.DiceTerm
      || t
      instanceof Terms.Die
      || t?.constructor?.name
      === "DiceTerm"
      || t?.constructor?.name
      === "Die";

    const isNumeric = (t) => t instanceof Terms.NumericTerm || t?.constructor?.name === "NumericTerm";

    const isOperator = (t) => t instanceof Terms.OperatorTerm || t?.constructor?.name === "OperatorTerm";

    const hasChildren = (t) => Array.isArray(t?.terms);
    const getFlavor = (t) => t?.flavor ?? t?.options?.flavor ?? null;

    const walk = (term, inheritedFlavor = null) => {
      if (!term) {
        return;
      }

      if (hasChildren(term)) {
        const f = getFlavor(term) ?? inheritedFlavor;
        for (const c of term.terms) {
          walk(c, f);
        }
        return;
      }

      if (isOperator(term)) {
        return;
      }

      const flavor = getFlavor(term) ?? inheritedFlavor ?? "default";

      if (isDice(term)) {
        const count = Number(term.total ?? 0);
        if (count > 0) {
          stones.push({
            color: flavor,
            count,
            originalTerm: `${term.number}d${term.faces}`,
          });
        }
        return;
      }

      if (isNumeric(term)) {
        const count = Number(term.number ?? term.total ?? 0);
        if (count > 0) {
          stones.push({
            color: flavor,
            count,
            originalTerm: String(count),
          });
        }
      }
    };

    for (const t of roll.terms) {
      walk(t, null);
    }
    return stones;
  }

  /**
   * Detect a `pull(<countExpr>, <bagFormula>)` call in a formula.
   * @param {string} formula - The formula string to scan.
   * @returns {null | { before: string, after: string, pullCountExpr: string, bagFormula: string }}
   */
  static #scanForPull(formula) {
    const m = formula.match(/pull\s*\(/);
    if (!m) {
      return null;
    }

    const pullIdx = m.index;
    const before = formula.substring(0, pullIdx);
    const tail = formula.substring(pullIdx);

    const content = DeathBag.#extractFunctionContent(tail);
    const after = tail.substring(tail.indexOf(content) + content.length + 1);

    // find first top-level comma
    let depth = 0, comma = -1;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === "(") {
        depth++;
      } else if (ch === ")") {
        depth--;
      } else if (ch === "," && depth === 0) {
        comma = i;
        break;
      }
    }
    if (comma === -1) {
      throw new Error("Invalid pull() function: missing comma separator");
    }

    const pullCountExpr = content.substring(0, comma).trim();
    if (!pullCountExpr) {
      throw new Error("Invalid pull() function: empty pull count expression");
    }

    const bagFormula = content.substring(comma + 1).trim();
    if (!bagFormula) {
      throw new Error("Invalid pull() function: empty bag formula");
    }

    return {
      before,
      after,
      pullCountExpr,
      bagFormula,
    };
  }

  /**
   * Perform a pull without creating an instance manually.
   * @param {string} pullCountExpr - Expression for number of stones to pull (dice, math, and so on).
   * @param {string} bagFormula - Formula describing bag contents.
   * @param {object} [data={}] - Roll data context.
   * @returns {Promise<Object|null>} The pull result object, or null if invalid.
   */
  static async pull(pullCountExpr, bagFormula, data = {}) {
    const roll = new DeathBag(`pull(${pullCountExpr}, ${bagFormula})`, data);
    await roll.evaluate();
    return roll.pullResult;
  }

  /**
   * Captured at construction; resolved during evaluate().
   * @type {Teriock.RollOptions.PendingPullData|null}
   */
  _pendingPull = null;
  /** @type {Object|null} */
  pullResult = null;

  /**
   * Construct a new DeathBag instance.
   * @param {string} formula - The input formula, possibly containing a pull() function.
   * @param {object} data - Roll data context.
   * @param {object} [options={}] - Roll options.
   */
  constructor(formula, data, options = {}) {
    const spec = DeathBag.#scanForPull(formula);
    const safeFormula = spec ? (spec.before + "0" + spec.after) : formula;
    super(safeFormula, data, options);

    if (spec) {
      this._pendingPull = spec;
    }
  }

  /** @inheritDoc */
  async evaluate(options = {}) {
    if (this._pendingPull) {
      const {
        pullCountExpr,
        bagFormula,
        before,
        after,
      } = this._pendingPull;

      const countRoll = new foundry.dice.Roll(pullCountExpr, this.data);
      await countRoll.evaluate(options);
      const pullCount = Math.max(0, Math.floor(Number(countRoll.total ?? 0)));

      const bagRoll = new foundry.dice.Roll(bagFormula, this.data);
      await bagRoll.evaluate(options);

      const bag = DeathBag.#extractStonesFromRoll(bagRoll);
      const pullResult = DeathBag.#executePull({
        pullCount,
        bag,
        bagRoll,
      });

      this.pullResult = {
        ...pullResult,
        countRoll: countRoll._formula,
        countTotal: countRoll.total,
      };

      const resultFormula = DeathBag.#createPullResultFormula(pullResult);
      this._formula = `${before}${resultFormula}${after}`;
      this._pendingPull = null;
    }

    return await super.evaluate(options);
  }
}
