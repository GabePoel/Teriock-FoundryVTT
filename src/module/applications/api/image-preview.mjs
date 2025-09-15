import { imageContextMenuOptions } from "../shared/_module.mjs";

const {
  ux,
  api,
} = foundry.applications;

// noinspection JSClosureCompilerSyntax
/**
 * Image sheet for Teriock system image previews.
 * Provides image display functionality with context menus for image interactions.
 * @extends {ApplicationV2}
 */
export default class TeriockImagePreviewer extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  /**
   * Default options for the image sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: [
      "teriock",
      "image-preview",
    ],
    window: {
      icon: "fa-solid fa-image",
      title: "Image Preview",
      resizable: true,
    },
    position: {
      width: 250,
      height: 250,
    },
  };

  /**
   * Template parts configuration for the image sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    image: {
      template: "systems/teriock/src/templates/document-templates/shared/image.hbs",
      scrollable: [ "" ],
    },
  };

  /**
   * Creates a new image sheet instance.
   * @param {string} img - The image path to display.
   * @param {...any} args - Additional arguments to pass to the parent constructor.
   */
  constructor(img, ...args) {
    super(...args);
    this.img = img;
  }

  /**
   * Handles the render event for the image sheet.
   * Sets up the context menu for image interactions.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    new ux.ContextMenu(this.element, ".timage", imageContextMenuOptions, {
      eventName: "contextmenu",
      jQuery: false,
      fixed: true,
    });
  }

  /**
   * Prepares the context data for template rendering.
   * Provides the image path for the template.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext() {
    return {
      img: this.img,
    };
  }
}
