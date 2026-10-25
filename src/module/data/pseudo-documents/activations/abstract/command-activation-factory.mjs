import { mergeMetadata } from "../../../../utils/_module.mjs";
import BaseActivation from "./base-activation/base-activation.mjs";

const { fields } = foundry.data;

/**
 * A factory function to build a simple activation from a command.
 * @param {Teriock.Keys.Command} key
 * @returns {typeof BaseActivation}
 */
export default function CommandActivationFactory(key) {
  /**
   * @property {object} options
   */
  class CommandActivation extends BaseActivation {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { type: key });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { options: new fields.ObjectField() });
    }

    /**
     * Take or reverse this activation's command for all its actors.
     * @param {"take"|"reverse"} action
     * @returns {Promise<void>}
     */
    async #act(action) {
      const result = await game.teriock.commands[action](key, this.actors, { event: this.event, ...this.options });
      if (!result) { return; }
      ui.notifications.success(
        `TERIOCK.ACTIVATIONS.Command.NOTIFICATIONS.${action === "take" ? "executed" : "reversed"}`,
        { format: { command: _loc(this.label) }, localize: true },
      );
    }

    /** @inheritDoc */
    get label() {
      return this.display.label || game.teriock.commands.getValue(key, "label", this.options);
    }

    /** @inheritDoc */
    get typeIcon() {
      return this.display.icon || game.teriock.commands.getValue(key, "icon", this.options) || this.metadata.icon;
    }

    /** @inheritDoc */
    async primaryAction() {
      await this.#act("take");
    }

    /** @inheritDoc */
    async secondaryAction() {
      if (TERIOCK.CONFIG.command[key].reverse) { await this.#act("reverse"); }
    }
  }

  return CommandActivation;
}
