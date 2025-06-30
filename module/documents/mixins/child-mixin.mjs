/** @import { MessageOptions } from "../../types/messages" */
/** @import Document from "@common/abstract/document.mjs"; */
/** @import TeriockActor from "../actor.mjs"; */
const { ux } = foundry.applications;
import { buildMessage } from "../../helpers/messages-builder/message-builder.mjs";

/**
 * Mixin for common functions used across document classes embedded in actors.
 * @template {import("@common/_types.mjs").Constructor<Document>} BaseDocument
 * @param {BaseDocument} Base
 * @returns {new (...args: any[]) => BaseDocument & {
 *   hookCall(incant: string, ...args: any[]): void;
 *   chat(): Promise<void>;
 *   chatImage(): Promise<void>;
 *   roll(options: object): Promise<void>;
 *   use(options: object): Promise<void>;
 *   duplicate(): Promise<ChildDocumentMixin>;
 *   buildRawMessage(options: MessageOptions): string;
 *   buildMessage(options: MessageOptions): Promise<string>;
 *   getActor(): TeriockActor;
 *   wikiPull(): Promise<void>;
 *   wikiOpen(): Promise<void>;
 * }}
 */
export const ChildDocumentMixin = (Base) =>
  class ChildDocumentMixin extends Base {
    get isFluent() {
      let fluent = false;
      if (this.system.fluent) {
        fluent = true;
      }
      return fluent;
    }

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
     * @param {string} incant
     * @param {string[]} args
     */
    hookCall(incant, args = []) {
      incant = "ter." + incant + this.type.charAt(0).toUpperCase() + this.type.slice(1);
      Hooks.call(incant, this, ...args);
    }

    /**
     * @returns {Promise<void>}
     */
    async chat() {
      let content = await this.buildMessage();
      content = `<div class="teriock">${content}</div>`;
      await ChatMessage.create({
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
      });
    }

    /**
     * @returns {Promise<void>}
     */
    async chatImage() {
      const img = this.img;
      if (img) {
        await ChatMessage.create({
          content: `<div class="timage" data-src="${img}" style="display: flex; justify-content: center;"><img src="${img}" alt="${this.name}" class="teriock-image"></div>`,
          speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
        });
      }
    }

    /**
     * @param {object} options
     * @returns {Promise<void>}
     */
    async roll(options) {
      await this.chat();
    }

    /**
     * @param {object} options
     * @returns {Promise<void>}
     */
    async use(options) {
      this.hookCall("use");
      await this.system.use(options);
    }

    /**
     * @returns {Promise<ChildDocumentMixin>}
     */
    async duplicate() {
      const copy = foundry.utils.duplicate(this);
      const copyDocument = await this.parent.createEmbeddedDocuments(this.documentName, [copy]);
      await this.parent.forceUpdate();
      return copyDocument[0];
    }

    /**
     * @param {MessageOptions} options
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
     * @param {MessageOptions} options
     * @returns {Promise<string>}
     */
    async buildMessage(options = {}) {
      const rawMessage = this.buildRawMessage(options);
      return await ux.TextEditor.enrichHTML(rawMessage.outerHTML);
    }

    /**
     * @returns {TeriockActor}
     */
    getActor() {
      if (this.documentName === "Actor") {
        return this;
      } else if (this.parent?.documentName === "Actor") {
        return this.parent;
      } else {
        return this.parent?.parent;
      }
    }

    /**
     * @returns {Promise<void>}
     */
    async wikiPull() {
      ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
    }

    /**
     * @returns {Promise<void>}
     */
    async wikiOpen() {
      await this.wikiPull();
    }
  };
