const { Document } = foundry.abstract;
const { ux } = foundry.applications;
import { buildMessage } from "../../helpers/messages-builder/message-builder.mjs";

/**
 * Mixin for common functions used across document classes embedded in actors.
 *
 * @param {DeepPartial<Document>} BaseDocument
 * @mixin
 */
export default (BaseDocument) => {
  return class ChildDocument extends BaseDocument {
    /**
     * Checks if the document is fluent.
     *
     * @returns {boolean} True if the document is fluent, false otherwise.
     */
    get isFluent() {
      let fluent = false;
      if (this.system.fluent) {
        fluent = true;
      }
      return fluent;
    }

    /**
     * Checks if the document is proficient.
     *
     * @returns {boolean} True if the document is proficient, false otherwise.
     */
    get isProficient() {
      let proficient = false;
      if (this.system.proficient) {
        proficient = true;
      }
      if (this.parent?.system.proficient) {
        proficient = true;
      }
      if (this.isFluent) {
        proficient = true;
      }
      return proficient;
    }

    /**
     * Calls a hook with the document as the first parameter.
     *
     * @param {string} incant - The hook incantation to call.
     * @param {string[]} args - Additional arguments to pass to the hook.
     */
    hookCall(incant, args = []) {
      incant =
        "teriock." +
        incant +
        this.type.charAt(0).toUpperCase() +
        this.type.slice(1);
      Hooks.call(incant, this, ...args);
    }

    /**
     * Sends a chat message with the document's content.
     *
     * @returns {Promise<void>} Promise that resolves when the chat message is sent.
     */
    async chat() {
      this.hookCall("chat");
      let content = await this.buildMessage();
      content = `<div class="teriock">${content}</div>`;
      await ChatMessage.create({
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      });
    }

    /**
     * Sends a chat message with the document's image.
     *
     * @returns {Promise<void>} Promise that resolves when the image message is sent.
     */
    async chatImage() {
      const img = this.img;
      if (img) {
        await ChatMessage.create({
          content: `
            <div class="timage" data-src="${img}" style="display: flex; justify-content: center;">
              <img src="${img}" alt="${this.name}" class="teriock-image">
            </div>`,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
      }
    }

    /**
     * Rolls the item, delegating to the system's roll method.
     *
     * @param {object} options - Options for the roll.
     * @returns {Promise<void>} Promise that resolves when the roll is complete.
     */
    async roll(options) {
      await this.chat();
    }

    /**
     * Uses the document, calling hooks and delegating to the system's use method.
     *
     * @param {object} options - Options for using the document.
     * @returns {Promise<void>} Promise that resolves when the use action is complete.
     */
    async use(options) {
      await this.system.use(options);
    }

    /**
     * Duplicates the document within its parent.
     *
     * @returns {Promise<ChildDocument>} Promise that resolves to the duplicated document.
     */
    async duplicate() {
      const copy = foundry.utils.duplicate(this);
      const copyDocument = await this.parent.createEmbeddedDocuments(
        this.documentName,
        [copy],
      );
      await this.parent.forceUpdate();
      this.hookCall("duplicate", [this, copyDocument[0]]);
      return copyDocument[0];
    }

    /**
     * Builds a raw message string from the document's message parts.
     *
     * @param {Teriock.MessageOptions} options - Options for building the message.
     * @returns {HTMLDivElement} The raw message HTML.
     */
    buildRawMessage(options = {}) {
      let messageParts;
      const secret = options.secret || false;
      if (secret) {
        messageParts = this.system.secretMessageParts;
      } else {
        messageParts = this.system.messageParts;
      }
      return buildMessage(messageParts);
    }

    /**
     * Builds an enriched message from the document's message parts.
     *
     * @param {Teriock.MessageOptions} options - Options for building the message.
     * @returns {Promise<string>} Promise that resolves to the enriched message HTML.
     */
    async buildMessage(options = {}) {
      let rawMessage = this.buildRawMessage(options);
      rawMessage = this.system.adjustMessage(rawMessage);
      return await ux.TextEditor.enrichHTML(rawMessage.outerHTML);
    }

    /**
     * Attempts to pull content from the wiki (default implementation shows error).
     *
     * @returns {Promise<void>} Promise that resolves when the wiki pull is complete.
     */
    async wikiPull() {
      ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
    }

    /**
     * Opens the wiki for this document (default implementation calls wikiPull).
     *
     * @returns {Promise<void>} Promise that resolves when the wiki is opened.
     */
    async wikiOpen() {
      ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
    }
  };
};
