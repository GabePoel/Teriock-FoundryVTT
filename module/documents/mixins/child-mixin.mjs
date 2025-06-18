const { ux } = foundry.applications;
import { buildMessage } from "../../helpers/messages-builder/message-builder.mjs";

/** @import Document from "@common/abstract/document.mjs"; */

/**
 * Mixin for common functions used across document classes embedded in actors.
 * @template {import("@common/_types.mjs").Constructor<Document>} BaseDocument
 * @param {BaseDocument} Base
 *
 */
export const MixinChildDocument = (Base) => class MixinChildDocument extends Base {

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    let fluent = false;
    let proficient = false;
    if (this.system?.fluent) {
      fluent = true;
    }
    if (this.parent?.system?.fluent) {
      fluent = true;
    }
    if (this.system?.proficient) {
      proficient = true;
    }
    if (this.parent?.system?.proficient) {
      proficient = true;
    }
    if (fluent) {
      proficient = true;
    }
    this.system.isFluent = fluent;
    this.system.isProficient = proficient;
  }

  hookCall(incant, args = []) {
    incant = 'ter.' + incant + this.type.charAt(0).toUpperCase() + this.type.slice(1);
    Hooks.call(incant, this, ...args);
  }

  async chat() {
    let content = await this.buildMessage();
    content = `<div class="teriock">${content}</div>`;
    await ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
    });
  }

  async chatImage() {
    const img = this.img;
    if (img) {
      await ChatMessage.create({
        content: `<div class="timage" data-src="${img}" style="display: flex; justify-content: center;"><img src="${img}" alt="${this.name}" class="teriock-image"></div>`,
        speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
      });
    }
  }

  async roll(options) {
    await this.chat();
  }

  async use(options) {
    this.hookCall('use');
    this.system.use(options);
  }

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

  async buildMessage(options = {}) {
    const rawMessage = this.buildRawMessage(options);
    return await ux.TextEditor.enrichHTML(rawMessage.outerHTML);
  }

  getActor() {
    if (this.documentName === 'Actor') {
      return this;
    } else if (this.parent?.documentName === 'Actor') {
      return this.parent;
    } else {
      return this.parent?.parent;
    }
  }

  async wikiPull() {
    ui.notifications.error(`There are no ${this.type} pages on the wiki.`)
  }

  async wikiOpen() {
    await this.wikiPull();
  }
};