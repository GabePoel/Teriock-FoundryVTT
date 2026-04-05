import TakeRoll from "./take-roll.mjs";

export default class HarmRoll extends TakeRoll {
  /**
   * Get a mapping to all the registered harms of a certain type.
   * @param {string} type
   * @returns {Promise<Record<string, TeriockJournalEntryPage>>}
   */
  static async getHarmTypes(type) {
    const sourceUuids = game.settings.get("teriock", `${type}TypeSources`);
    const sources = /** @type {TeriockJournalEntry[]} */ await Promise.all(
      Array.from(sourceUuids).map((uuid) => foundry.utils.fromUuid(uuid)),
    );
    const types = {};
    sources.forEach((source) => {
      Object.assign(
        types,
        Object.fromEntries(
          source.pages.contents
            .filter((p) => p.type === type)
            .map((d) => [d.forcedIdentifier, d]),
        ),
      );
    });
    return types;
  }

  /**
   * The types of this harm.
   * @returns {string[]}
   */
  get harmTypes() {
    const types = new Set();
    for (const term of this._allTerms) {
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
    if (!["damage", "drain"].includes(this.take)) return [];
    const harmMap = await HarmRoll.getHarmTypes(this.take);
    const harms = [];
    for (const type of this.harmTypes) {
      if (Object.keys(harmMap).includes(type)) harms.push(harmMap[type]);
    }
    return harms;
  }

  /** @inheritDoc */
  async getPanels() {
    const harmArray = await this.getHarmArray();
    return Promise.all(harmArray.map((h) => h.toPanel()));
  }
}
