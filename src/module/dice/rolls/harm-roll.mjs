import { getHarmTypes } from "../../helpers/fetch.mjs";
import TakeRoll from "./take-roll.mjs";

export default class HarmRoll extends TakeRoll {
  /**
   * The types of this harm.
   * @returns {string[]}
   */
  get harmTypes() {
    const types = new Set();
    for (const term of this.terms) {
      const flavor = term.flavor.split(" ");
      flavor.forEach((type) => types.add(type));
    }
    return Array.from(types);
  }

  /** @inheritDoc */
  async getButtons() {
    const harmArray = await this.getHarmArray();
    const buttons = await super.getButtons();
    harmArray.forEach((h) => {
      const automations = h.system.automations.contents;
      automations.forEach((a) => {
        buttons.push(...a.buttons);
      });
    });
    buttons
      .filter(
        (b) =>
          b.dataset.action === "take-rollable-take" && b.dataset.amount === "0",
      )
      .forEach((b) => (b.dataset.amount = this.total.toString()));
    return buttons;
  }

  /**
   * The harms that are invoked by this roll.
   * @returns {Promise<TeriockJournalEntryPage[]>}
   */
  async getHarmArray() {
    const harmMap = await getHarmTypes(this.take);
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
