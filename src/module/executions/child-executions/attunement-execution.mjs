import { DocumentExecution } from "../abstract/_module.mjs";

/**
 * @property {TeriockAttunement} source
 */
export default class AttunementExecution extends DocumentExecution {
  /** @type {boolean} */
  #deattune = false;

  /** @inheritDoc */
  get _dialogButtons() {
    const [useButton] = super._dialogButtons;
    return [useButton, {
      action: "confirm",
      icon: TERIOCK.display.icons.attunable.deattune,
      label: "TERIOCK.SYSTEMS.Attunable.MENU.deattune",
      name: "deattune",
      callback: () => (this.#deattune = true),
    }];
  }

  /** @inheritDoc */
  async _buildTags() {
    await super._buildTags();
    if (this.#deattune) { this.tags.push(_loc("TERIOCK.SYSTEMS.Attunement.USAGE.deattuned")); }
  }

  /** @inheritDoc */
  async _postExecute() {
    if (this.#deattune) { await this.source.system.deattune(); }
    return super._postExecute();
  }
}
