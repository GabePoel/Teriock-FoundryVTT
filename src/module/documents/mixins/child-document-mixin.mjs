import { TeriockChatMessage } from "../_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @param {typeof CommonDocument} Base
 * @mixin
 */
export default function ChildDocumentMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ClientDocument}
     * @mixes CommonDocument
     * @mixes PanelDocument
     * @mixin
     */
    class ChildDocument extends Base {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, {
          child: true,
        });
      }

      /**
       * Treat this document as if it doesn't exist.
       * @returns {boolean}
       */
      get isEphemeral() {
        return this.system.makeEphemeral;
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (this.checkEditor(userId) && this.actor) {
          this.actor.system.postUpdate();
        }
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (this.checkEditor(userId) && this.actor) {
          this.actor.system.postUpdate();
        }
      }

      /**
       * Get all ActiveEffects that may apply to this document.
       * @yields {TeriockActiveEffect}
       * @returns {Generator<TeriockActiveEffect, void, void>}
       */
      *allApplicableEffects() {
        if (this.actor) {
          for (const effect of this.actor.allApplicableEffects()) {
            yield effect;
          }
        }
      }

      /**
       * Sends a chat message with the document's image.
       * @returns {Promise<void>}
       */
      async chatImage() {
        const img = this.img;
        if (img) {
          await TeriockChatMessage.create({
            content: `
            <div class="timage" data-src="${img}" style="display: flex; justify-content: center;">
              <img src="${img}" alt="${this.name}" class="teriock-image">
            </div>`,
            speaker: TeriockChatMessage.getSpeaker({ actor: this.actor }),
          });
        }
      }

      /**
       * Duplicates the document within its parent.
       * @returns {Promise<TeriockChild>}
       */
      async duplicate() {
        const copy = foundry.utils.duplicate(this.toObject());
        copy._stats.duplicateSource = this.uuid;
        let copyDocument;
        if (this.isEmbedded) {
          copyDocument = await this.parent.createEmbeddedDocuments(
            this.documentName,
            [copy],
          );
        } else if (this.inCompendium) {
          copyDocument = await this.constructor.create(copy, {
            pack: this.compendium.collection,
          });
        } else {
          copyDocument = await this.constructor.create(copy);
        }
        return copyDocument[0];
      }

      /**
       * Roll data.
       * @returns {object}
       */
      getRollData() {
        return this.system.getRollData();
      }

      /** @inheritDoc */
      prepareData() {
        super.prepareData();
        if (!this.isEmbedded) {
          this.prepareSpecialData();
          this.prepareVirtualEffects();
        }
      }

      /**
       * Does whatever the default roll/execution for this document is.
       * @param {Teriock.Interaction.UseOptions} options
       * @returns {Promise<void>}
       */
      async use(options = {}) {
        await this.system.use(options);
      }

      /**
       * Opens the document's page on [the Teriock wiki](https://wiki.teriock.com).
       * @returns {Promise<void>}
       */
      async wikiOpen() {
        ui.notifications.error("TERIOCK.SYSTEMS.Wiki.DIALOG.open.error", {
          format: { value: this.name },
          localize: true,
        });
      }
    }
  );
}
