import { listFormat } from "../../helpers/localization.mjs";
import { fromIdentifier } from "../../utils/_module.mjs";
import CommandsRoll from "./commands-roll/commands-roll.mjs";

export default class HarmRoll extends CommandsRoll {
  /**
   * Cached array of harms to reduce async calls.
   * @type {TeriockJournalEntryPage<"damage" | "drain">[]}
   */
  _harms;

  /**
   * The types of this harm.
   * @returns {Identifier[]}
   */
  get harmIdentifiers() {
    const types = new Set();
    for (const term of [...this._allTerms, ...this.dice]) {
      const flavor = term.flavor.split(" ");
      flavor.forEach(type => types.add(type.trim()));
    }
    return Array.from(types);
  }

  /** @inheritDoc */
  async _applyDiceStyles() {
    await super._applyDiceStyles();
    const harms = await this.getHarmArray();
    const harmMap = Object.fromEntries(harms.map(h => [h.system.identifier, h]));
    for (const die of this.dice) {
      const types = die.flavor.split(" ");
      for (const [type, harm] of Object.entries(harmMap)) {
        if (types.includes(type)) {
          const rollStyleAutomations = harm.system.automations.getTypeSync("rollStyle");
          if (!rollStyleAutomations.length) { continue; }
          for (const a of rollStyleAutomations) {
            die.options.appearance = foundry.utils.mergeObject(die.options.appearance ?? {}, a.style || {});
            die.options.sfx = foundry.utils.mergeObject(die.options.sfx ?? {}, a.sfx || {});
          }
        }
      }
    }
  }

  /** @inheritDoc */
  async getAutomations() {
    const harmArray = await this.getHarmArray();
    return [...(await super.getAutomations()), ...harmArray.flatMap(h => h.system.automations.contents)];
  }

  /**
   * The harms that are invoked by this roll.
   * @returns {Promise<TeriockJournalEntryPage<"damage" | "drain">[]>}
   */
  async getHarmArray() {
    if (this._harms) { return this._harms; }
    const commands = this.commands.filter(i => ["damage", "drain"].includes(i));
    const identifiers = commands.flatMap(command => this.harmIdentifiers.map(i => `${command}:${i}`));
    const harms = await Promise.all(identifiers.map(i => fromIdentifier(i)));
    this._harms = harms.filter(Boolean);
    return this._harms;
  }

  /** @inheritDoc */
  async getPanels() {
    const harmArray = await this.getHarmArray();
    return Promise.all(harmArray.map(async h => Object.assign(await h.getPanelParts(), { collapsed: true })));
  }

  /** @inheritDoc */
  getTooltipParts() {
    const parts = super.getTooltipParts();
    if (!this.commands.includes("damage") && !this.commands.includes("drain")) { return parts; }
    for (const p of parts) {
      if (p.flavor) {
        p.flavor = listFormat(
          p.flavor.split(" ").map(i => {
            let flavor;
            if (this.commands.includes("damage") && !flavor) {
              flavor = game.teriock.identifiers.getName(`damage:${i}`);
            }
            if (this.commands.includes("drain") && !flavor) {
              flavor = game.teriock.identifiers.getName(`drain:${i}`);
            }
            return flavor ? flavor : p.flavor;
          }),
          { sort: true, style: "short", type: "unit" },
        );
      }
    }
    return parts;
  }
}
