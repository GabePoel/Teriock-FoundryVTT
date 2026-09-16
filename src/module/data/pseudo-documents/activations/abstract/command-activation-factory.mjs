import { mergeMetadata } from "../../../../helpers/construction.mjs";
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
    static metadata = mergeMetadata(super.metadata, { type: entry.id });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { options: new fields.ObjectField() });
    }

    /** @inheritDoc */
    get label() {
      return this.display.label || getCommandEntryValue(entry, "label", this.options);
    }

    /** @inheritDoc */
    get typeIcon() {
      return this.display.icon || getCommandEntryValue(entry, "icon", this.options) || this.metadata.icon;
    }

    /** @inheritDoc */
    async primaryAction() {
      if (!this.checkActors() || typeof entry.primary !== "function") { return; }
      await Promise.all(this.actors.map(a => entry.primary(a, Object.assign({ event: this.event }, this.options))));
      ui.notifications.success("TERIOCK.ACTIVATIONS.Command.NOTIFICATIONS.applied", {
        format: { command: this.label },
        localize: true,
      });
    }

    /** @inheritDoc */
    async secondaryAction() {
      if (!this.checkActors() || typeof entry.secondary !== "function") { return; }
      await Promise.all(this.actors.map(a => entry.secondary(a, Object.assign({ event: this.event }, this.options))));
      ui.notifications.success("TERIOCK.ACTIVATIONS.Command.NOTIFICATIONS.reversed", {
        format: { command: this.label },
        localize: true,
      });
    }
  }

  return CommandActivation;
}
