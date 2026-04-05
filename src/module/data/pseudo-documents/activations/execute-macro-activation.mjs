import { icons } from "../../../constants/display/icons.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {UUID<TeriockMacro>} macro
 * @property {object} scope
 */
export default class ExecuteMacroActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return icons.document.macro;
  }

  /** @inheritDoc */
  static get TYPE() {
    return "executeMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      macro: new fields.DocumentUUIDField({ type: "Macro" }),
      scope: new fields.ObjectField(),
    });
  }

  /** @inheritDoc */
  async primaryAction() {
    const scope = Object.assign(
      {
        activation: this,
        actor:
          this.actors.length > 0
            ? this.actors[0]
            : TeriockChatMessage.getSpeakerActor(
                TeriockChatMessage.getSpeaker(),
              ),
        actors: this.actors,
        event: this.event,
        message: this.document,
        speaker: TeriockChatMessage.getSpeaker(),
        tokens: this.tokens,
      },
      this.scope ?? {},
    );
    const macro = await fromUuid(this.macro);
    await macro.execute(scope);
  }
}
