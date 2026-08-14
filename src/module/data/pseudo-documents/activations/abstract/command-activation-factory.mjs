import { getCommandEntryValue } from "../../../../helpers/interaction/command-helpers.mjs";
import BaseActivation from "./base-activation/base-activation.mjs";

const { fields } = foundry.data;

/**
 * A factory function to build a simple activation from a command entry.
 * @param {Teriock.Command.CommandEntry} entry
 * @returns {typeof BaseActivation}
 */
export default function CommandActivationFactory(entry) {
  /**
   * @property {object} options
   */
  class CommandActivation extends BaseActivation {
    /** @inheritDoc */
    static get TYPE() {
      return entry.id;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { options: new fields.ObjectField() });
    }

    /** @inheritDoc */
    get icon() {
      return this.symbol || getCommandEntryValue(entry, "icon", this.options);
    }

    /** @inheritDoc */
    get label() {
      return this.title || getCommandEntryValue(entry, "label", this.options);
    }

    /** @inheritDoc */
    async primaryAction() {
      if (!this.checkActors() || typeof entry.primary !== "function") { return; }
      for (const a of this.actors) { await entry.primary(a, Object.assign({ event: this.event }, this.options)); }
    }

    /** @inheritDoc */
    async secondaryAction() {
      if (!this.checkActors() || typeof entry.secondary !== "function") { return; }
      for (const a of this.actors) { await entry.secondary(a, Object.assign({ event: this.event }, this.options)); }
    }
  }

  return CommandActivation;
}
