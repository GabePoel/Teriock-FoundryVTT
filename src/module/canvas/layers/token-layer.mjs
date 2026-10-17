import { DocumentSelector } from "../../applications/dialogs/_module.mjs";

const { TokenLayer } = foundry.canvas.layers;

/** @inheritDoc */
export default class TeriockTokenLayer extends TokenLayer {
  /**
   * Select targeted token documents.
   * @param {Teriock.Select.SelectDocumentsDialogOptions & { user?: TeriockUser }} options
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async selectTargeted(options = {}) {
    const user = options.user ?? game.user;
    const key = (options.multi ?? true) ? "SelectTargetedTokens" : "SelectTargetedToken";
    return DocumentSelector.selectMulti(user.targets.map(t => t.document), {
      hint: _loc(`TERIOCK.SYSTEMS.User.DIALOGS.${key}.hint`),
      silent: true,
      title: _loc(`TERIOCK.SYSTEMS.User.DIALOGS.${key}.title`),
      tooltip: false,
      ...options,
    });
  }

  /**
   * Select visible token documents.
   * @param {Teriock.Select.SelectDocumentsDialogOptions} options
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async selectVisible(options = {}) {
    const key = (options.multi ?? true) ? "SelectVisibleTokens" : "SelectVisibleToken";
    return DocumentSelector.selectMulti(this.placeables.filter(t => t.isVisible).map(t => t.document), {
      hint: _loc(`TERIOCK.SYSTEMS.User.DIALOGS.${key}.hint`),
      silent: true,
      title: _loc(`TERIOCK.SYSTEMS.User.DIALOGS.${key}.title`),
      tooltip: false,
      ...options,
    });
  }
}
