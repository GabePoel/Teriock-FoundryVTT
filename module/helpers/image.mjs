const { api } = foundry.applications;

export class TeriockImage extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
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
}