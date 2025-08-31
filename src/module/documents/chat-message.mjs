const { ChatMessage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link ChatMessage} implementation.
 * @mixes ClientDocumentMixin
 * @extends {ChatMessage}
 * @property {"ChatMessage"} documentName
 */
export default class TeriockChatMessage extends ChatMessage {
  /** @inheritDoc */
  async renderHTML(options) {
    const html = await super.renderHTML(options);
    await this.system.alterMessageHTML(html);
    return html;
  }
}
