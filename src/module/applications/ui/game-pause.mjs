const { GamePause } = foundry.applications.ui;

/** @inheritDoc */
export default class TeriockGamePause extends GamePause {
  /** @type {string[]} */
  static HOLD_THUMBNAILS = Object.values(TERIOCK.DISPLAY.thumbnails.manifest.hold);

  /** @inheritDoc */
  async _prepareContext(options) {
    const thumbnails = this.constructor.HOLD_THUMBNAILS;
    return Object.assign(await super._prepareContext(options), {
      icon: thumbnails[Math.floor(Math.random() * thumbnails.length)],
    });
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    super._replaceHTML(result, content, options);
    content.classList.toggle("teriock-paused", game.paused);
  }
}
