import { thumbnails } from "../../static/display/_module.mjs";

const { GamePause } = foundry.applications.ui;

/** @inheritDoc */
export default class TeriockGamePause extends GamePause {
  /** @type {string[]} */
  static HOLD_IMAGES = Object.values(thumbnails.manifest.hold);

  /** @inheritDoc */
  async _prepareContext(options) {
    const images = this.constructor.HOLD_IMAGES;
    return Object.assign(await super._prepareContext(options), {
      icon: images[Math.floor(Math.random() * images.length)],
    });
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    super._replaceHTML(result, content, options);
    content.classList.toggle("teriock-paused", game.paused);
  }
}
