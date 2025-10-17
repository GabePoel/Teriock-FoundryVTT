import { systemPath } from "../helpers/path.mjs";

const { ChatMessage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link ChatMessage} implementation.
 * @mixes ClientDocumentMixin
 * @extends {ChatMessage}
 * @property {"ChatMessage"} documentName
 */
export default class TeriockChatMessage extends ChatMessage {
  /**
   * Whether the avatar image should be rescaled.
   * @returns {boolean}
   */
  get rescale() {
    const token = this.speakerToken;
    return !!(token && token.ring.enabled);
  }

  /**
   * An image representing the speaker of this message.
   * @returns {string}
   */
  get speakerImg() {
    const token = this.speakerToken;
    if (token) {
      return token.texture.src;
    }
    const actor = this.speakerActor;
    if (actor) {
      return actor.img;
    }
    if (this.system.avatar) {
      return this.system.avatar;
    }
    return systemPath("icons/documents/character.svg");
  }

  /**
   * The TokenDocument which represents the speaker of this message (if any).
   * @returns {TeriockTokenDocument|null}
   */
  get speakerToken() {
    if (this.speaker.scene && this.speaker.token) {
      //noinspection JSUnresolvedReference
      const scene = game.scenes.get(this.speaker.scene);
      return scene?.tokens.get(this.speaker.token) || null;
    }
    return null;
  }

  /** @inheritDoc */
  async renderHTML(options) {
    const html = await super.renderHTML(options);
    await this.system.alterMessageHTML(html);
    return html;
  }

  /** @inheritDoc */
  toObject() {
    const obj = super.toObject();
    obj.img = this.speakerImg;
    obj.rescale = this.rescale;
    if (this.author?.name !== this.alias) {
      obj.writer = this.author?.name;
    }
    return obj;
  }
}
