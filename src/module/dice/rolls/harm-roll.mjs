import { fromHarmIdentifier } from "../../helpers/utils.mjs";
import ImpactRoll from "./impact-roll.mjs";

export default class HarmRoll extends ImpactRoll {
  /**
   * The types of this harm.
   * @returns {Identifier[]}
   */
  get harmIdentifiers() {
    const types = new Set();
    for (const term of [...this._allTerms, ...this.dice]) {
      const flavor = term.flavor.split(" ");
      flavor.forEach((type) => types.add(type.trim()));
    }
    return Array.from(types);
  }

  /** @inheritDoc */
  async getActivations() {
    let activations = await super.getActivations();
    const harmArray = await this.getHarmArray();
    for (const h of harmArray) {
      const automations = h.system.automations.contents;
      const activationLists = await Promise.all(
        automations.map((a) => a.getActivations()),
      );
      activationLists.forEach((a) => activations.push(...a));
    }
    activations =
      teriock.data.pseudoDocuments.activations.RollActivation.mergeRolls(
        activations,
      );
    return activations;
  }

  /**
   * The harms that are invoked by this roll.
   * @returns {Promise<TeriockJournalEntryPage[]>}
   */
  async getHarmArray() {
    if (!["damage", "drain"].includes(this.impact)) return [];
    const identifiers = this.harmIdentifiers.map((i) => `${this.impact}:${i}`);
    const harms = await Promise.all(
      identifiers.map((i) => fromHarmIdentifier(i)),
    );
    return harms.filter((_) => _);
  }

  /** @inheritDoc */
  async getPanels() {
    const harmArray = await this.getHarmArray();
    return Promise.all(harmArray.map((h) => h.toPanel()));
  }
}
