import { TeriockDialog } from "../../applications/api/_module.mjs";
import { interpretTerm, parsePayload } from "../../applications/ux/enrichment-helpers.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { DealCommandExecution } from "../../executions/activity-executions/_module.mjs";
import { batchWrite, makeIconClass, toCamelCase } from "../../utils/_module.mjs";

const { fields } = foundry.data;

/**
 * Runs the commands in `TERIOCK.CONFIG.command` on any number of Actors at once.
 */
export default class CommandManager {
  constructor() {
    for (const [key, entry] of Object.entries(TERIOCK.CONFIG.command)) {
      for (const name of [key, ...(entry.aliases ?? [])]) { this.aliases.set(name.toLowerCase(), key); }
    }
  }

  /**
   * Deal a numeric command by rolling its formula.
   * @param {Teriock.Keys.Command} key
   * @param {TeriockActor[]} actors
   * @param {Teriock.Command.DealOptions} options
   * @param {boolean} showDialog
   * @returns {Promise<{ actors: TeriockActor[] }>}
   */
  async #deal(key, actors, options, showDialog) {
    const netBoosts = options.boosts ?? 0;
    await DealCommandExecution.create({
      boosts: Math.max(netBoosts, 0),
      commands: [key],
      crit: options.crit,
      deboosts: Math.max(-netBoosts, 0),
      formula: options.formula || "0",
    }, { actor: actors[0] ?? null, document: options.document, rollData: options.rollData, showDialog });
    return { actors };
  }

  /**
   * Prompt once for the amount of a numeric command.
   * @param {Teriock.Config.CommandEntry} entry
   * @param {object} options
   * @param {number|null} [options.amount]
   * @param {boolean} [options.morganti]
   * @returns {Promise<{ amount: number|null, morganti: boolean }|null>}
   */
  async #prompt(entry, { amount, morganti }) {
    const initialAmount = amount ?? (entry.numeric.nullable ? null : 0);
    const amountField = new fields.NumberField({
      initial: initialAmount,
      integer: entry.numeric.integer,
      label: _loc("TERIOCK.AUTOMATIONS.Take.FIELDS.amount.label"),
      min: entry.numeric.min,
      nullable: Boolean(entry.numeric.nullable),
      placeholder: entry.numeric.nullable ? "" : "0",
    });
    const morgantiField = new fields.BooleanField({
      initial: Boolean(morganti),
      label: _loc("TERIOCK.TERMS.DamageTypes.morganti"),
    });
    const rootId = foundry.utils.randomID();
    const content = document.createElement("div");
    content.append(amountField.toFormGroup({ rootId }, { name: "amount", value: initialAmount }));
    if (entry.numeric.morganti) {
      content.append(morgantiField.toFormGroup({ rootId }, { name: "morganti", value: Boolean(morganti) }));
    }
    return TeriockDialog.prompt({
      content,
      modal: true,
      ok: {
        callback: (_event, button) => {
          const value = button.form.elements.namedItem("amount").value;
          return {
            amount: typeof value === "string" && value.length > 0 ? Number(value) : null,
            morganti: Boolean(entry.numeric.morganti && button.form.elements.namedItem("morganti")?.checked),
          };
        },
      },
      window: { icon: makeIconClass(entry.icon, "title"), title: entry.numeric.take },
    });
  }

  /**
   * Resolve options for each Actor. Numeric formulas are evaluated against each Actor's roll data.
   * @param {Teriock.Config.CommandEntry} entry
   * @param {TeriockActor[]} actors
   * @param {object} options
   * @returns {Promise<object[]>}
   */
  async #resolve(entry, actors, options) {
    if (!entry.numeric || options.formula == null) { return actors.map(() => options); }
    return Promise.all(
      actors.map(async a => ({
        ...options,
        amount: await BaseRoll.getValue(options.formula || "0", a?.getRollData() ?? {}),
      })),
    );
  }

  /**
   * Collect operations from each Actor and write them in one batch.
   * @param {(actor: TeriockActor, options: object) => Promise<object[]>|object[]} fn
   * @param {TeriockActor[]} actors
   * @param {object[]} resolved
   * @returns {Promise<void>}
   */
  async #write(fn, actors, resolved) {
    const operations = await Promise.all(actors.map((a, i) => fn?.(a, resolved[i]) ?? []));
    await batchWrite(operations.flat());
  }

  /**
   * All the acceptable chat aliases for each command.
   * @type {Map<string, Teriock.Keys.Command>}
   */
  aliases = new Map();

  /**
   * Build command options from some payload string.
   * @param {string} payload
   * @param {Teriock.Keys.Command} key
   * @returns {Record<string, Teriock.System.Serializable>}
   */
  buildOptions(payload, key) {
    const entry = TERIOCK.CONFIG.command[key];
    if (entry.numeric) {
      // Special handling for starting with a "take" argument
      const formula = payload.replace(/^take\b\s*/i, "");
      if (formula === payload) { return { formula }; }
      return formula ? { apply: true, formula } : { apply: true, showDialog: true };
    }
    const input = parsePayload(payload, { hasConfig: true, hasMultipleArguments: true });
    const options = Object.fromEntries(Object.entries(input.config).map(([k, v]) => [toCamelCase(k), v]));
    (entry.args ?? []).slice(0, input.arguments.length).forEach((arg, i) => {
      options[arg] = interpretTerm(input.arguments[i]);
    });
    return options;
  }

  /**
   * Get a display value from a command for a given property that might depend on its options.
   * @param {Teriock.Keys.Command} key
   * @param {"icon"|"label"} property
   * @param {object} [options]
   * @returns {string}
   */
  getValue(key, property, options = {}) {
    const value = TERIOCK.CONFIG.command[key]?.[property];
    return (typeof value === "function" ? value(options) : value) ?? "";
  }

  /**
   * Get the command key for a key or alias.
   * @param {string} name
   * @returns {Teriock.Keys.Command|undefined}
   */
  resolve(name) {
    return this.aliases.get(name?.toLowerCase());
  }

  /**
   * Reverse a command for some Actors.
   * @param {Teriock.Keys.Command} key
   * @param {TeriockActor[]} [actors]
   * @param {object} [options]
   * @returns {Promise<{ actors: TeriockActor[], amount?: number|null }|null>}
   */
  async reverse(key, actors = game.actors.selected, options = {}) {
    const entry = TERIOCK.CONFIG.command[key];
    if (entry?.numeric && options.formula != null && !options.apply) {
      return this.#deal(key, actors, options, !game.settings.get("teriock", "showRollDialogs"));
    }
    if (typeof entry?.reverse === "string") { return this.take(entry.reverse, actors, options); }
    if (typeof entry?.reverse !== "function") { return null; }
    if (!entry.noActor && !game.actors.check(actors)) { return null; }
    await this.#write(entry.reverse, actors, await this.#resolve(entry, actors, options));
    return { actors, amount: options.amount };
  }

  /**
   * Take a command for some Actors. Shows at most one dialog and writes all changes in one batch.
   * @param {Teriock.Keys.Command} key
   * @param {TeriockActor[]} [actors]
   * @param {object} [options]
   * @returns {Promise<{ actors: TeriockActor[], amount?: number|null, morganti?: boolean }|null>}
   */
  async take(key, actors = game.actors.selected, options = {}) {
    const entry = TERIOCK.CONFIG.command[key];
    if (!entry) { return null; }
    if (entry.numeric && options.formula != null && !options.apply) {
      return this.#deal(key, actors, options, game.settings.get("teriock", "showRollDialogs"));
    }
    if (!entry.noActor && !game.actors.check(actors)) { return null; }
    options = { ...options };
    if (entry.numeric) { options.morganti = Boolean(entry.numeric.morganti && options.morganti); }
    if (entry.numeric && options.showDialog) {
      const result = await this.#prompt(entry, options);
      if (!result) { return null; }
      Object.assign(options, result);
    }
    const resolved = await this.#resolve(entry, actors, options);
    if (entry.trigger) {
      await Promise.all(
        actors.map((a, i) =>
          a.fireTrigger(key, {
            amount: resolved[i].amount,
            ...Object.fromEntries((entry.args ?? []).map(arg => [arg, options[arg]])),
          })
        ),
      );
    }
    if (entry.execute) {
      if ((await entry.execute(actors, options)) === false) { return null; }
    } else { await this.#write(entry.operations, actors, resolved); }
    return { actors, amount: options.amount, morganti: options.morganti };
  }
}
