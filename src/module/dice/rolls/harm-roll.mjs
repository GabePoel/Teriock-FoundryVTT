import { fromHarmIdentifier } from "../../helpers/utils.mjs";
import ImpactRoll from "./impact-roll.mjs";

export default class HarmRoll extends ImpactRoll {
  /**
   * Cached array of harms to reduce async calls.
   * @type {TeriockHarm[]}
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
      for (const [type, harm] of Object.entries(harmMap)) {
        if (die.flavor.includes(type)) {
          const rollStyleAutomations = /** @type {RollStyleAutomation[]} */ harm.system.automations.filter(
            a => a.type === "rollStyle",
          );
          if (!rollStyleAutomations.length) continue;
          for (const a of rollStyleAutomations) {
            die.options.appearance = foundry.utils.mergeObject(die.options.appearance ?? {}, a.style || {});
            die.options.sfx = foundry.utils.mergeObject(die.options.sfx ?? {}, a.sfx || {});
          }
        }
      }
    }
  }

  /** @inheritDoc */
  async getActivations() {
    let activations = await super.getActivations();
    const harmArray = await this.getHarmArray();
    for (const h of harmArray) {
      const automations = h.system.automations.contents;
      const activationLists = await Promise.all(automations.map(a => a.getActivations()));
      activationLists.forEach(a => activations.push(...a));
    }
    activations = teriock.data.pseudoDocuments.activations.RollActivation.mergeRolls(activations);
    return activations;
  }

  /**
   * The harms that are invoked by this roll.
   * @returns {Promise<TeriockHarm[]>}
   */
  async getHarmArray() {
    if (!["damage", "drain"].includes(this.impact)) return [];
    if (this._harms) return this._harms;
    const identifiers = this.harmIdentifiers.map(i => `${this.impact}:${i}`);
    const harms = await Promise.all(identifiers.map(i => fromHarmIdentifier(i)));
    this._harms = harms.filter(Boolean);
    return this._harms;
  }

  /** @inheritDoc */
  async getPanels() {
    const harmArray = await this.getHarmArray();
    return Promise.all(harmArray.map(h => h.toPanel()));
  }
}
