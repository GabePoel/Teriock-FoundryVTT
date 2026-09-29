import { DocumentSelector } from "../../applications/dialogs/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { User } = foundry.documents;

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 */

/**
 * The Teriock User implementation.
 * @extends {User}
 * @mixes BaseDocument
 * @property {Readonly<Set<TeriockToken>>} targets
 */
export default class TeriockUser extends mixClasses(User, BaseDocumentMixin) {
  /**
   * The tokens this user can currently see.
   * @returns {Set<TeriockToken>}
   */
  get visibleTokens() {
    return new Set(game.canvas?.tokens.placeables.filter(t => t.isVisible) ?? []);
  }

  /**
   * Select one targeted token document.
   * @param {Teriock.Select.SelectDocumentDialogOptions} options
   * @returns {Promise<TeriockTokenDocument|null>}
   */
  async selectTargetedToken(options = {}) {
    return DocumentSelector.selectSingle(this.targets.map(t => t.document), {
      hint: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedToken.hint"),
      imgKey: "texture.src",
      silent: true,
      title: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedToken.title"),
      tooltip: false,
      ...options,
    });
  }

  /**
   * Select any number of targeted token documents.
   * @param {Teriock.Select.SelectDocumentsDialogOptions} options
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async selectTargetedTokens(options = {}) {
    return DocumentSelector.selectMulti(this.targets.map(t => t.document), {
      hint: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedTokens.hint"),
      imgKey: "texture.src",
      silent: true,
      title: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedTokens.title"),
      tooltip: false,
      ...options,
    });
  }

  /**
   * Select one visible token document.
   * @param {Teriock.Select.SelectDocumentDialogOptions} options
   */
  async selectVisibleToken(options = {}) {
    return DocumentSelector.selectSingle(this.visibleTokens.map(t => t.document), {
      hint: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleToken.hint"),
      imgKey: "texture.src",
      silent: true,
      title: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleToken.title"),
      tooltip: false,
      ...options,
    });
  }

  /**
   * Select any number of the visible token documents.
   * @param {Teriock.Select.SelectDocumentsDialogOptions} options
   * @returns {Promise<TeriockTokenDocument[]>}
   */
  async selectVisibleTokens(options = {}) {
    return DocumentSelector.selectMulti(this.visibleTokens.map(t => t.document), {
      hint: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleTokens.hint"),
      imgKey: "texture.src",
      silent: true,
      title: _loc("TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleTokens.title"),
      tooltip: false,
      ...options,
    });
  }
}
