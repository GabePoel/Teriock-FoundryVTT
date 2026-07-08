import { dedent } from "../../helpers/string.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { ChatMessage } = foundry.documents;

/**
 * The Teriock ChatMessage implementation.
 * @implements {Teriock.Documents.ChatMessageInterface}
 * @extends {ChatMessage}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 */
export default class TeriockChatMessage extends documentMixins.BaseDocumentMixin(ChatMessage) {
  /**
   * @inheritDoc
   * @param {object[]} [data]
   * @param {Partial<DatabaseCreateOperation & { defaultMode: boolean}>} [operation]
   */
  static async createDocuments(data = [], operation = {}) {
    for (const d of data) {
      if (d.speaker?.img) { foundry.utils.setProperty(d, "system.img", d.speaker.img); }
      if (operation.defaultMode) { this.applyMode(d, game.settings.get("core", "messageMode")); }
    }
    return super.createDocuments(data, operation);
  }

  /**
   * Share an image to the chat.
   * @param {string} img
   * @param {object} [options]
   * @param {TeriockActor} [options.actor]
   * @param {string} [options.name]
   * @returns {Promise<void>}
   */
  static async fromImg(img, options = {}) {
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
   * Attempt to determine who is the image for a certain chat message.
   * @param {object} options
   * @param {TeriockActor} [options.actor]
   * @param {TeriockToken|TeriockTokenDocument} [options.token]
   * @param {TeriockScene} [options.scene]
   * @param {string} [options.img]
   * @returns {string|null}
   */
  static getImg(options = {}) {
    // Mirror the cases of `getSpeaker` so that have the correct image.

    // Case 0: An image is explicitly provided.
    if (typeof options.img === "string") { return options.img; }

    // Case 1: A token is explicitly provided.
    if (options.token instanceof foundry.canvas.placeables.Token) { options.token = options.token.document; }
    if (options.token instanceof foundry.documents.TokenDocument) { return options.token.img; }

    // Case 2: An actor is explicitly provided
    if (options.actor instanceof foundry.documents.Actor) { return options.actor.img; }

    // Case 3: Not the viewed scene
    if (options.scene instanceof foundry.documents.Scene) {
      const character = game.user.character;
      if (character) { return character.img; }
    }

    // Case 4: Infer from controlled tokens
    if (canvas.ready) {
      const controlled = canvas.tokens.controlled;
      if (controlled.length) { return controlled.shift().document.img; }
    }

    // Case 5 - Infer from impersonated Actor
    const character = game.user.character;
    if (character) {
      const tokens = character.getActiveTokens(false, true);
      if (tokens.length) { return tokens.shift()?.img; }
    }

    // Case 6 - Let it be
    return null;
  }

  /**
   * @inheritDoc
   * @param {object} options
   * @param {TeriockActor} [options.actor]
   * @param {TeriockToken|TeriockTokenDocument} [options.token]
   * @param {TeriockScene} [options.scene]
   * @param {string} [options.img]
   * @returns {scene?: ID<TeriockScene>, actor?: ID<TeriockActor>, token?: ID<TeriockTokenDocument>, alias?: string, img?: Teriock.System.ImageString}
   */
  static getSpeaker(options = {}) {
    return Object.assign(super.getSpeaker(options), { img: this.getImg(options) });
  }

  /**
   * An image representing the speaker of this message.
   * @returns {string}
   */
  get speakerImg() {
    return this.system.img ?? this.speakerToken?.img ?? this.speakerActor?.img ?? this.author.avatar;
  }

  /**
   * The TokenDocument which represents the speaker of this message (if any).
   * @returns {TeriockTokenDocument|null}
   */
  get speakerToken() {
    if (this.speaker.scene && this.speaker.token) {
      const scene = game.scenes.get(this.speaker.scene);
      return scene?.tokens.get(this.speaker.token) ?? null;
    }
    return null;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (!foundry.utils.hasProperty(data, "flags.core.canPopout")) {
      this.updateSource({ "flags.core.canPopout": true });
    }
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
}
