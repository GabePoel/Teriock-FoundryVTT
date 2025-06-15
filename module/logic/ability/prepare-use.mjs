const { ux, api, fields } = foundry.applications;

export class TeriockPrepareUseDialog extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['teriock', 'prepare-use-dialog'],
    window: {
      icon: `fa-solid fa-gear`,
      title: 'Prepare Use',
      resizable: true,
    },
    position: {
      width: 400,
      height: 300,
    }
  }

  static PARTS = {
    content: {
      template: 'systems/teriock/templates/logic/ability/prepare-use.hbs',
      scrollable: [''],
    }
  }

  constructor(ability, ...args) {
    super(...args);
    this.ability = ability;
  }

  /** @override */
  async _prepareContext() {
    return {
      ability: this.ability
    }
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
  }
}