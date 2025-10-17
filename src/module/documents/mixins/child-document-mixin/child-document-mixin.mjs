import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import TeriockChatMessage from "../../chat-message.mjs";
import { applyCertainChanges } from "../shared/_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @param {ClientDocument} Base
 * @mixin
 */
export default (Base) => {
  return (
    /**
     * @implements {ChildDocumentMixinInterface}
     * @extends ClientDocument
     */
    class ChildDocumentMixin extends Base {
      //noinspection ES6ClassMemberInitializationOrder
      overrides = this.overrides ?? {};

      /** @inheritDoc */
      get isFluent() {
        let fluent = false;
        if (this.system.fluent) {
          fluent = true;
        }
        return fluent;
      }

      /** @inheritDoc */
      get isProficient() {
        let proficient = false;
        if (this.system.proficient) {
          proficient = true;
        }
        if (this.parent?.system.proficient) {
          proficient = true;
        }
        if (this.isFluent) {
          proficient = true;
        }
        return proficient;
      }

      /**
       * Get the key that defines this in the index, if appropriate.
       * @returns {string}
       */
      get key() {
        const pageName = foundry.utils.getProperty(
          this,
          this.metadata.pageNameKey,
        );
        if (pageName) {
          return toCamelCase(pageName);
        } else {
          return toCamelCase(this.name);
        }
      }

      /** @inheritDoc */
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
                property.length > 0 && property !== "0" && property !== 0;
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
        if (this._sheet) {
          this.sheet.render();
        }
      }

      /** @inheritDoc */
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

      /** @inheritDoc */
      async duplicate() {
        const copy = foundry.utils.duplicate(this);
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
        await this.parent.forceUpdate();
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

      /** @inheritDoc */
      async roll(options) {
        await this.toMessage(options);
      }

      /** @inheritDoc */
      async toMessage(options) {
        const data = { doc: this.parent };
        await this.hookCall("documentChat", data);
        if (data.cancel) {
          return;
        }
        const panel = await this.toPanel();
        const actor = options?.actor || this.actor;
        const messageData = {
          speaker: TeriockChatMessage.getSpeaker({
            actor: actor,
          }),
          system: {
            avatar: actor.img,
            bars: [],
            blocks: [],
            buttons: [],
            extraContent: "",
            panels: [panel],
            source: null,
            tags: [],
          },
        };
        console.log(messageData);
        TeriockChatMessage.applyRollMode(
          messageData,
          game.settings.get("core", "rollMode"),
        );
        await TeriockChatMessage.create(messageData);
      }

      /** @inheritDoc */
      async toPanel() {
        return await TeriockTextEditor.enrichPanel(this.system.messageParts);
      }

      /** @inheritDoc */
      async toTooltip() {
        return await TeriockTextEditor.makeTooltip(this.system.messageParts);
      }

      /** @inheritDoc */
      async use(options) {
        await this.system.use(options);
      }

      /** @inheritDoc */
      async wikiOpen() {
        foundry.ui.notifications.error(
          `There are no ${this.type} pages on the wiki.`,
        );
      }

      /** @inheritDoc */
      async wikiPull() {
        foundry.ui.notifications.error(
          `There are no ${this.type} pages on the wiki.`,
        );
      }
    }
  );
};
