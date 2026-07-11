import { getCommandEntryValue } from "../../../../helpers/interaction/command-helpers.mjs";
import BaseActivation from "./base-activation.mjs";

const { fields } = foundry.data;

/**
 * A factory function to build a simple activation from a command entry.
 * @param {Teriock.Command.CommandEntry} command
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
      return this.symbol || getCommandEntryValue(command, "icon", this.options);
    }

    /** @inheritDoc */
    get label() {
      return this.title || getCommandEntryValue(command, "label", this.options);
    }

    /** @inheritDoc */
    async primaryAction() {
      if (!this.checkActors() || typeof command.primary !== "function") { return; }
      for (const a of this.actors) { await command.primary(a, Object.assign({ event: this.event }, this.options)); }
    }

    /** @inheritDoc */
    async secondaryAction() {
      if (!this.checkActors() || typeof command.secondary !== "function") { return; }
      for (const a of this.actors) { await command.secondary(a, Object.assign({ event: this.event }, this.options)); }
    }
  }

  return CommandActivation;
}
