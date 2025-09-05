import { buildMessage } from "../../../helpers/messages-builder/message-builder.mjs";
import { systemPath } from "../../../helpers/path.mjs";

const { ux } = foundry.applications;

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 *
 * @param {ClientDocument} Base
 * @mixin
 */
export default (Base) => {
  return (
    /**
     * @implements {ChildDocumentMixinInterface}
     * @extends ClientDocument
     */
    class ChildDocumentMixin extends Base {
      /** @inheritDoc */
      get isFluent() {
        let fluent = false;
        if (this.system.fluent) {
          fluent = true;
        }
        return fluent;
      }

      /** @inheritDoc */
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

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        if (!data.img)
          this.updateSource({
            img: systemPath(`icons/documents/${data.type}.svg`),
          });
        return super._preCreate(data, options, user);
      }

      /** @inheritDoc */
      async buildMessage(options = {}) {
        let rawMessage = this.buildRawMessage(options);
        rawMessage = this.system.adjustMessage(rawMessage);
        return await ux.TextEditor.enrichHTML(rawMessage.outerHTML);
      }

      /** @inheritDoc */
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

      /** @inheritDoc */
      async chat() {
        const data = { doc: this.parent };
        await this.hookCall("documentChat", data);
        if (data.cancel) return;
        let content = await this.buildMessage();
        content = `<div class="teriock">${content}</div>`;
        await ChatMessage.create({
          content: content,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
      }

      /** @inheritDoc */
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

      /** @inheritDoc */
      async duplicate() {
        const copy = foundry.utils.duplicate(this);
        const data = { doc: this.parent, copy: copy };
        await this.hookCall("documentDuplicate", data);
        if (data.cancel) return data.copy;
        const copyDocument = await this.parent.createEmbeddedDocuments(
          this.documentName,
          [data.copy],
        );
        await this.parent.forceUpdate();
        return copyDocument[0];
      }

      /** @inheritDoc */
      async roll(_options) {
        await this.chat();
      }

      /** @inheritDoc */
      async use(options) {
        await this.system.use(options);
      }

      /** @inheritDoc */
      async wikiOpen() {
        ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
      }

      /** @inheritDoc */
      async wikiPull() {
        ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
      }
    }
  );
};
