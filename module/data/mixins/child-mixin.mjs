/** @import { MessageParts } from "../../types/messages"; */

const { fields } = foundry.data;

/**
 * Mixin that provides child document functionality for embedded documents.
 * Adds proficiency tracking, font customization, and message generation capabilities.
 * @template {Function} Base - The base class constructor to extend.
 * @param {Base} Base - The base class to mix in with.
 * @returns {Base} The extended class with child document functionality.
 */
export const ChildDataMixin = (Base) =>
  class ChildDataMixin extends Base {
    /**
     * Defines the schema for child document data fields.
     * Includes proficiency flags, font customization, and description fields.
     * @returns {object} The schema definition for child document fields.
     * @override
     */
    static defineSchema() {
      return {
        proficient: new fields.BooleanField({
          initial: false,
          label: "Proficient",
        }),
        fluent: new fields.BooleanField({
          initial: false,
          label: "Fluent",
        }),
        font: new fields.StringField({
          initial: "",
          label: "Font",
          hint: "The font to be used for this document's name on its sheet and in chat messages.",
        }),
        description: new fields.HTMLField({ initial: "<p>None.</p>" }),
      };
    }

    /**
     * Initiates a roll for the child document.
     * Delegates to the parent document's chat functionality.
     * @param {object} options - Options for the roll operation.
     * @returns {Promise<void>} Promise that resolves when the roll is complete.
     */
    async roll(options) {
      await this.parent.chat(options);
    }

    /**
     * Uses the child document, which triggers a roll.
     * Alias for the roll method to provide consistent interface.
     * @param {object} options - Options for the use operation.
     * @returns {Promise<void>} Promise that resolves when the use is complete.
     */
    async use(options) {
      await this.roll(options);
    }

    /**
     * Gets the message parts for displaying the child document in chat.
     * Includes image, name, and font information from the parent document.
     * @returns {MessageParts} Object containing message display components.
     */
    get messageParts() {
      return {
        image: this.parent.img,
        name: this.parent.name,
        bars: [],
        blocks: [],
        font: this.font,
      };
    }

    /**
     * Gets the secret message parts for displaying hidden child documents.
     * Uses generic uncertainty image and type-based name for privacy.
     * @returns {MessageParts} Object containing secret message display components.
     */
    get secretMessageParts() {
      return {
        image: "systems/teriock/assets/uncertainty.svg",
        name: this.parent.type.charAt(0).toUpperCase() + this.parent.type.slice(1),
        bars: [],
        blocks: [],
        font: null,
      };
    }
  };
