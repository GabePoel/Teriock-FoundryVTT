const { User } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link User} implementation.
 * @extends {JournalEntry}
 * @mixes ClientDocumentMixin
 * @property {"User"} documentName
 * @property {Set<TeriockToken>} targets
 */
export default class TeriockUser extends User {
  /**
   * Is this user currently active?
   * @returns {boolean}
   */
  get isActive() {
    return (
      this.active &&
      (this.lastActivityTime === 0 || Date.now() - this.lastActivityTime < 120)
    );
  }
}
