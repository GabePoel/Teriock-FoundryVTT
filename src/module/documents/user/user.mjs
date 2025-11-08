import { BlankMixin } from "../mixins/_module.mjs";

const { User } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link User} implementation.
 * @extends User
 * @mixes ClientDocumentMixin
 */
export default class TeriockUser extends BlankMixin(User) {
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
}
