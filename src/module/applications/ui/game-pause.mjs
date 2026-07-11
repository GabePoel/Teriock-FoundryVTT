import { holdIcons } from "../../constants/display/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";

const { GamePause } = foundry.applications.ui;

/** @inheritDoc */
export default class TeriockGamePause extends GamePause {
  /** @type {string[]} */
  static HOLD_ICONS = Object.values(holdIcons);

  /**
   * Select a random hold image.
   * @returns {Promise<string>}
   */
  async #selectHoldImage() {
    const index = await BaseRoll.getValue(`1d${this.constructor.HOLD_ICONS.length} - 1`);
    return this.constructor.HOLD_ICONS[index];
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      cssClass: game.paused ? "teriock-paused" : "",
      icon: await this.#selectHoldImage(),
    });
  }

  /** @inheritDoc */
  _replaceHTML(result, content, _options) {
    super._replaceHTML(result, content, _options);
    content.classList.toggle("teriock-paused", game.paused);
  }
}
