import { makeIcon, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { User } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock User implementation.
 * @extends {User}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.UserInterface}
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
    if (this.character) parts.subtitle = this.character.fullName;
    return parts;
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: _loc("TERIOCK.SYSTEMS.User.EMBED.openCharacter"),
        icon: makeIcon(TERIOCK.options.document.character.icon, "contextMenu"),
        callback: async () => await this.character.sheet.render(true),
        condition: () => this.character && this.character.isViewer,
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }
}
