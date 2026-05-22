import { getInteractionEntryValue } from "../../../../helpers/interaction/interaction-tools.mjs";
import BaseActivation from "./base-activation.mjs";

const { fields } = foundry.data;

/**
 * A factory function to build a simple activation from a command entry.
 * @param {Teriock.Interaction.CommandEntry} command
 * @returns {typeof CommandActivation}
 */
export default function CommandActivationFactory(command) {
  /**
   * @property {object} options
   */
  class CommandActivation extends BaseActivation {
    /** @inheritDoc */
    static get TYPE() {
      return command.id;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { options: new fields.ObjectField() });
    }

    /** @inheritDoc */
    get icon() {
      return this.symbol || getInteractionEntryValue(command, "icon", this.options);
    }

    /** @inheritDoc */
    get label() {
      return this.title || getInteractionEntryValue(command, "label", this.options);
    }

    /** @inheritDoc */
    async primaryAction() {
      if (!this.checkActors()) return;
      for (const a of this.actors) await command.primary(a, Object.assign({ event: this.event }, this.options));
    }

    /** @inheritDoc */
    async secondaryAction() {
      if (!this.checkActors()) return;
      for (const a of this.actors) await command.secondary(a, Object.assign({ event: this.event }, this.options));
    }
  }

  return CommandActivation;
}
