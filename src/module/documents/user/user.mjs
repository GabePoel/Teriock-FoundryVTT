import { makeIcon, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { User } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link User} implementation.
 * @extends {User}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 */
export default class TeriockUser extends mix(
  User,
  mixins.BaseDocumentMixin,
  mixins.EmbedCardDocumentMixin,
) {
  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.img = this.avatar;
    if (this.character) {
      parts.subtitle = this.character.nameString;
    }
    return parts;
  }

  //noinspection JSUnusedGlobalSymbols
  /**
   * Is this user currently active?
   * @returns {boolean}
   */
  get isActive() {
    return (
      this.active &&
      (this.lastActivityTime === 0 ||
        (Date.now() - this.lastActivityTime) / 1000 < 120)
    );
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: "Open Character",
        icon: makeIcon("user", "contextMenu"),
        callback: async () => await this.character.sheet.render(true),
        condition: () => this.character && this.character.isViewer,
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }
}
