import { DocumentSelector } from "../../applications/dialogs/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { makeIcon } from "../../helpers/icon.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { User } = foundry.documents;

/**
 * The Teriock User implementation.
 * @extends {User}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.UserInterface}
 * @property {Readonly<Set<TeriockToken>>} targets
 */
export default class TeriockUser
  extends mixClasses(User, documentMixins.BaseDocumentMixin, documentMixins.EmbedCardDocumentMixin)
{
  /** @inheritDoc */
  get embedParts() {
    const parts = Object.assign(super.embedParts, { img: this.avatar });
    if (this.character) { parts.subtitle = this.character.fullName; }
    return parts;
  }

  /**
   * The tokens this user can currently see.
   * @returns {Set<TeriockToken>}
   */
  get visibleTokens() {
    return new Set(game.canvas?.tokens.placeables.filter(t => t.isVisible) ?? []);
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [{
      icon: makeIcon(TERIOCK.config.document.character.icon, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.User.EMBED.openCharacter"),
      onClick: async () => await this.character.sheet.render(true),
      visible: () => this.character && this.character.isViewer,
    }, ...super.getCardContextMenuEntries(doc)];
  }

  /**
   * Select one targeted token document.
   * @param {Teriock.Select.SelectDocumentDialogOptions} options
   * @returns {Promise<TeriockTokenDocument|null>}
   */
  async selectTargetedToken(options = {}) {
    return DocumentSelector.selectSingle(this.targets.map(t => t.document), {
      hint: "TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedToken.hint",
      imgKey: "texture.src",
      silent: true,
      title: "TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedToken.title",
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
      hint: "TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedTokens.hint",
      imgKey: "texture.src",
      silent: true,
      title: "TERIOCK.SYSTEMS.User.DIALOGS.SelectTargetedTokens.title",
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
      hint: "TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleToken.hint",
      imgKey: "texture.src",
      silent: true,
      title: "TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleToken.title",
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
      hint: "TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleTokens.hint",
      imgKey: "texture.src",
      silent: true,
      title: "TERIOCK.SYSTEMS.User.DIALOGS.SelectVisibleTokens.title",
      tooltip: false,
      ...options,
    });
  }
}
