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
  /** @inheritDoc */
  get typeIcon() {
    return "fas fa-user";
  }
}
