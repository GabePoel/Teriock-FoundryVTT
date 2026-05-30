import { systemPath } from "../../helpers/path.mjs";
import { dedent } from "../../helpers/string.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { ChatMessage } = foundry.documents;

/**
 * The Teriock ChatMessage implementation.
 * @implements {Teriock.Documents.ChatMessageInterface}
 * @extends {ChatMessage}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 */
export default class TeriockChatMessage extends BaseDocumentMixin(ChatMessage) {
  /**
   * @inheritDoc
   * @param {object} data
   * @param {Partial<DatabaseCreateOperation & { defaultMode: boolean} >} [operation]
   */
  static async create(data = {}, operation = {}) {
    if (operation.defaultMode) { this.applyMode(data, game.settings.get("core", "messageMode")); }
    return super.create(data, operation);
  }

  /**
   * Share an image to the chat.
   * @param {string} img
   * @param {object} [options]
   * @param {TeriockActor} [options.actor]
   * @param {string} [options.name]
   * @returns {Promise<void>}
   */
  static async fromImage(img, options = {}) {
    if (!img) { return; }
    await this.create({
      content: dedent(`
      <div class="timage" data-src="${img}" style="display: flex; justify-content: center;" data-openable="true">
        <img src="${img}" alt="${options.name || ""}" class="teriock-image" data-openable="true">
      </div>`),
      speaker: this.getSpeaker({ actor: options.actor }, { defaultMode: true }),
    });
  }

  /**
   * An image representing the speaker of this message.
   * @returns {string}
   */
  get speakerImg() {
    const token = this.speakerToken;
    if (token) { return token.img; }
    const actor = this.speakerActor;
    if (actor) { return actor.img; }
    if (this.system.avatar) { return this.system.avatar; }
    return systemPath("icons/documents/character.svg");
  }

  /**
   * The TokenDocument which represents the speaker of this message (if any).
   * @returns {TeriockTokenDocument|null}
   */
  get speakerToken() {
    if (this.speaker.scene && this.speaker.token) {
      const scene = game.scenes.get(this.speaker.scene);
      return scene?.tokens.get(this.speaker.token) || null;
    }
    return null;
  }

  /** @inheritDoc */
  async renderHTML(options = {}) {
    // Rolls being hidden when content is not otherwise visible reveals more information than it hides
    if (!this.isContentVisible) { for (const r of this.rolls) { r.hideRoll = false; } }
    const context = await this.system._prepareContext(options);
    const element = await super.renderHTML(context);
    await this.system._onRender(context, { element, ...options });
    return element;
  }

  /** @inheritDoc */
  toObject(source = true) {
    const obj = super.toObject(source);
    obj.img = this.speakerImg;
    if (this.author?.name !== this.alias) { obj.writer = this.author?.name; }
    if (!this.isContentVisible) { obj.system.panels.length = 0; }
    return obj;
  }
}
