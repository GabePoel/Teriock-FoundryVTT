import { icons } from "../../../../constants/display/icons.mjs";
import TeriockChatMessage from "../../../../documents/chat-message/chat-message.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class MacroActivation extends BaseActivation {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { icon: icons.document.macro });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "macro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      primaryMacro: new fields.DocumentUUIDField({ type: "Macro" }),
      scope: new fields.ObjectField(),
      secondaryMacro: new fields.DocumentUUIDField({ type: "Macro" }),
    });
  }

  /**
   * Execute one of this activation's macros.
   * @param {UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async #execute(uuid) {
    if (!uuid) { return; }
    const macro = await fromUuid(uuid);
    await macro?.execute(this.#getScope());
  }

  /**
   * The scope that this activation's macros are executed with.
   * @returns {object}
   */
  #getScope() {
    return Object.assign({
      activation: this,
      actor: this.actors.length > 0
        ? this.actors[0]
        : TeriockChatMessage.getSpeakerActor(TeriockChatMessage.getSpeaker()),
      actors: this.actors,
      event: this.event,
      message: this.document,
      speaker: TeriockChatMessage.getSpeaker(),
      tokens: this.tokens,
    }, this.scope ?? {});
  }

  /** @inheritDoc */
  async primaryAction() {
    await this.#execute(this.primaryMacro);
  }

  /** @inheritDoc */
  async secondaryAction() {
    await this.#execute(this.secondaryMacro);
  }
}
