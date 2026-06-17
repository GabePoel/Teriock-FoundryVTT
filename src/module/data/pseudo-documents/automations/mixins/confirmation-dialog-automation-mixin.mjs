import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Automation to enable/disable confirmation dialogs.
 * @param {typeof BaseAutomation} Base
 */
export default function ConfirmationDialogAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {boolean} showConfirmationDialog
     */
    class ConfirmationDialogAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ConfirmationDialog"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          showConfirmationDialog: new fields.BooleanField({ initial: true }),
        });
      }

      /**
       * Helper method to prefix localization strings.
       * @param {string} str
       * @returns {string}
       */
      #pre(str) {
        return `TERIOCK.AUTOMATIONS.ConfirmationDialog.${str}`;
      }

      /**
       * Confirmation paths.
       * @returns {string[]}
       */
      get _confirmationPaths() {
        return ["showConfirmationDialog"];
      }

      /**
       * Whether to show a warning message if there's no confirmation dialog.
       * @returns {boolean}
       */
      get _showConfirmationWarning() {
        return !this.showConfirmationDialog;
      }

      /** @inheritDoc */
      get formMessages() {
        const messages = super.formMessages;
        if (this._showConfirmationWarning) {
          messages.unshift({ level: "warning", text: this.#pre("NOTIFICATIONS.noConfirmation") });
        }
        return messages;
      }

      /**
       * Get confirmation to proceed.
       * @param {object} [options]
       * @param {object} [options.data]
       * @param {string} [options.content]
       * @param {string} [options.icon]
       * @param {string} [options.title]
       * @param {object} [dialog]
       * @returns {Promise<boolean>}
       */
      async getConfirmation(options = {}, dialog = {}) {
        const data = Object.assign({
          automation: _loc(this.label) ?? "",
          document: this.document.fullName ?? this.document.name ?? "",
        }, options.data ?? {});
        if (!this.showConfirmationDialog) { return true; }
        const contentString = options.content ?? this.#pre("DIALOG.content");
        const icon = options.icon ?? TERIOCK.display.icons.pseudoDocument.automation;
        const title = _loc(options.title ?? this.#pre("DIALOG.title"), data);
        const contentText = _loc(contentString, data);
        const content = await TeriockTextEditor.enrichHTML(`<p>${contentText}</p>`);
        const config = foundry.utils.mergeObject(
          { content, window: { icon: makeIconClass(icon, "title"), title } },
          dialog,
        );
        return TeriockDialog.confirm(config);
      }
    }
  );
}
