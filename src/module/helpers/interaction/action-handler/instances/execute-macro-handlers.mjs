import { makeIconClass } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

export class ExecuteMacroHandler extends ActionHandler {
  static ACTION = "execute-macro";

  /**
   * @inheritDoc
   * @param {UUID<TeriockMacro>} uuid
   * @param {object} [data]
   */
  static buildButton(uuid, data = {}) {
    const button = super.buildButton();
    button.icon = makeIconClass("code", "button");
    const macro = fromUuidSync(uuid);
    button.label = macro.name;
    button.dataset.uuid = uuid;
    button.dataset.use = JSON.stringify(data);
    return button;
  }

  async primaryAction() {
    const useData = JSON.parse(this.dataset.use);
    const scope = {
      actor:
        this.actors.length > 0
          ? this.actors[0]
          : ChatMessage.implementation.getSpeakerActor(
              ChatMessage.implementation.getSpeaker(),
            ),
      actors: this.actors,
      data: {
        execution: {
          useData: useData,
        },
      },
      dataset: this.dataset,
      event: this.event,
      speaker: ChatMessage.implementation.getSpeaker(),
      useData: useData,
    };
    const macroUuid = this.dataset.uuid;
    const macro = /** @type {TeriockMacro} */ await fromUuid(macroUuid);
    await macro.execute(scope);
  }
}
