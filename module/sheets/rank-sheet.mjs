const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
import { TeriockItemSheet } from './teriock-item-sheet.mjs';
import { rankContextMenu, classContextMenu, archetypeContextMenu } from './context-menus/rank-context-menus.mjs';
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockRankSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
  static DEFAULT_OPTIONS = {
    classes: ['rank'],
    window: {
      icon: "fa-solid fa-" + documentOptions.rank.icon,
    },
  };
  static PARTS = {
    all: {
      template: 'systems/teriock/templates/sheets/rank-template/rank-template.hbs',
      scrollable: [
        '.window-content',
        '.tsheet-page',
        '.ab-sheet-everything',
      ],
    },
  };

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext();
    context.enrichedDescription = await this._editor(this.item.system.description);
    context.enrichedFlaws = await this._editor(this.item.system.flaws);
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    [
      { selector: '.rank-box', menu: rankContextMenu },
      { selector: '.class-box', menu: classContextMenu },
      { selector: '.archetype-box', menu: archetypeContextMenu }
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.item), 'click');
    });
    [
      {
        selector: '.hit-die-box',
        confirmText: 'Are you sure you want to reroll how much HP you gain from this rank?',
        dieKey: 'hitDie',
        updateKey: 'hp'
      },
      {
        selector: '.mana-die-box',
        confirmText: 'Are you sure you want to reroll how much mana you gain from this rank?',
        dieKey: 'manaDie',
        updateKey: 'mana'
      }
    ].forEach(({ selector, confirmText, dieKey, updateKey }) => {
      const el = this.element.querySelector(selector);
      if (el) {
        el.addEventListener('click', async () => {
          const proceed = await DialogV2.confirm({
            content: confirmText,
            rejectClose: false,
            modal: true,
          });
          if (proceed) {
            const die = this.item.system[dieKey];
            const maxRoll = parseInt(die.slice(1), 10);
            const newValue = Math.floor(Math.random() * maxRoll) + 1;
            this.item.update({ [`system.${updateKey}`]: newValue });
          }
        });
      }
    });
  }
}