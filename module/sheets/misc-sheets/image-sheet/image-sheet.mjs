const { ux, api } = foundry.applications;
import { imageContextMenuOptions } from "../../../helpers/context-menus/image-context-menu.mjs";

export default class TeriockImageSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['teriock', 'image-preview'],
    window: {
      icon: `fa-solid fa-image`,
      title: 'Image Preview',
      resizable: true,
    },
    position: {
      width: 250,
      height: 250,
    }
  }

  static PARTS = {
    image: {
      template: 'systems/teriock/templates/common/image.hbs',
      scrollable: [''],
    }
  }

  constructor(img, ...args) {
    super(...args);
    this.img = img;
  }

  /** @override */
  async _prepareContext() {
    return {
      img: this.img
    }
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    new ux.ContextMenu(this.element, '.timage', imageContextMenuOptions,
      {
        eventName: 'contextmenu',
        jQuery: false,
        fixed: true,
      }
    );
  }
}