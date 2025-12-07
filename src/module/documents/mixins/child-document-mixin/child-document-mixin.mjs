import { TeriockChatMessage } from "../../_module.mjs";
import { applyCertainChanges } from "../shared/_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @param {typeof CommonDocument} Base
 * @constructor
 * @mixin
 */
export default function ChildDocumentMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ClientDocument}
     * @mixes PanelDocument
     * @mixes CommonDocument
     */
    class ChildDocument extends Base {
      //noinspection ES6ClassMemberInitializationOrder
      overrides = this.overrides ?? {};

      /**
       * Treat this document as if it doesn't exist.
       * @returns {boolean}
       */
      get isEphemeral() {
        return this.system.makeEphemeral;
      }

      /**
       * Checks for fluency in the document.
       * @returns {boolean}
       */
      get isFluent() {
        let fluent = false;
        if (this.system.fluent) {
          fluent = true;
        }
        if (this.elder?.isFluent) {
          fluent = true;
        }
        return fluent;
      }

      /**
       * Checks for proficiency in the document.
       * @returns {boolean}
       */
      get isProficient() {
        let proficient = false;
        if (this.system.proficient) {
          proficient = true;
        }
        if (this.elder?.isProficient) {
          proficient = true;
        }
        if (this.isFluent) {
          proficient = true;
        }
        return proficient;
      }

      /**
       * Generator that gives every {@link TeriockEffect} that applies to {@link TeriockChild} documents.
       * @yields {TeriockEffect}
       * @returns {Generator<TeriockEffect, void, void>}
       */
      *allSpecialEffects() {
        if (this.actor) {
          for (const effect of this.actor.specialEffects) {
            let shouldYield = false;
            for (const change of effect.specialChanges) {
              if (change.reference.type === this.type) {
                shouldYield = true;
              }
            }
            if (shouldYield) {
              yield effect;
            }
          }
        }
      }

      /**
       * Apply the special {@link TeriockEffect}s found by {@link TeriockChild} that this document matches.
       */
      applySpecialEffects() {
        const overrides = foundry.utils.deepClone(this.overrides ?? {});
        const changes = [];
        for (const effect of this.allSpecialEffects()) {
          if (!effect.active) {
            continue;
          }
          const candidateChanges = effect.specialChanges;
          for (const change of candidateChanges) {
            const reference = change.reference;
            const property = foundry.utils.getProperty(
              this,
              change.reference.key,
            );
            let shouldInclude = false;
            if (Object.keys(CONFIG.Dice.functions).includes(reference.check)) {
              const inclusionFunction = CONFIG.Dice.functions[reference.check];
              shouldInclude = inclusionFunction(reference.value, property);
            } else if (reference.check === "has") {
              const checkSet = new Set(property);
              shouldInclude = checkSet.has(reference.value);
            } else if (reference.check === "includes") {
              const checkArray = Array.from(property);
              shouldInclude = checkArray.includes(reference.value);
            } else if (reference.check === "exists") {
              shouldInclude =
                (property?.length || "") > 0 &&
                property !== "0" &&
                property !== 0;
            } else if (reference.check === "is") {
              shouldInclude = property;
            } else if (reference.check === "isNot") {
              shouldInclude = !property;
            }
            if (shouldInclude) {
              const fullChange = foundry.utils.deepClone(change);
              fullChange.effect = effect;
              fullChange.property ??= fullChange.mode * 10;
              changes.push(fullChange);
            }
          }
        }
        applyCertainChanges(this, changes, overrides);
        if (this._sheet && this.isOwner) {
          this.sheet.render();
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
        const data = {
          doc: this.parent,
          copy: copy,
        };
        await this.hookCall("documentDuplicate", data);
        if (data.cancel) {
          return data.copy;
        }
        const copyDocument = await this.parent.createEmbeddedDocuments(
          this.documentName,
          [data.copy],
        );
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
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        this.applySpecialEffects();
        super.prepareSpecialData();
      }

      /**
       * Does whatever the default roll/execution for this document is.
       * @param {object} options
       * @returns {Promise<void>}
       * @deprecated
       */
      async roll(options = {}) {
        await this.toMessage(options);
      }

      /** @inheritDoc */
      async toMessage(options = {}) {
        const data = { doc: this.parent };
        await this.hookCall("documentChat", data);
        if (data.cancel) {
          return;
        }
        return await super.toMessage(options);
      }

      /**
       * Does whatever the default roll/execution for this document is.
       * @param {object} options
       * @returns {Promise<void>}
       */ async use(options = {}) {
        await this.system.use(options);
      }

      /**
       * Opens the document's page on [the Teriock wiki](https://wiki.teriock.com).
       * @returns {Promise<void>}
       */
      async wikiOpen() {
        ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
      }

      /**
       * Pulls data for this document from [the Teriock wiki](https://wiki.teriock.com) and updates the document to
       * match.
       * @returns {Promise<void>}
       */
      async wikiPull() {
        ui.notifications.error(`There are no ${this.type} pages on the wiki.`);
      }
    }
  );
}
