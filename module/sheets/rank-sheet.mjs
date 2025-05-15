const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
import { TeriockItemSheet } from './teriock-item-sheet.mjs';
import { rankContextMenu, classContextMenu, archetypeContextMenu } from './context-menus/rank-context-menus.mjs';
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockRankSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'rank', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            onChat: this._onChat,
            viewDoc: this._viewDoc,
            createAbility: this._createAbility,
        },
        form: {
            submitOnChange: true,
        },
        window: {
            // resizable: true,
            icon: "fa-solid fa-" + documentOptions.rank.icon,
        },
        position: {
            width: 560,
        },
    };
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/common/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/sheets/rank-template/rank-template.hbs',
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
        const rankContextMenuOptions = rankContextMenu(this.item);
        this._connectContextMenu('.rank-box', rankContextMenuOptions, 'click');
        const classContextMenuOptions = classContextMenu(this.item);
        this._connectContextMenu('.class-box', classContextMenuOptions, 'click');
        const archetypeContextMenuOptions = archetypeContextMenu(this.item);
        this._connectContextMenu('.archetype-box', archetypeContextMenuOptions, 'click');
        this.element.querySelector('.hit-die-box').addEventListener('click', async (event) => {
            const proceed = await DialogV2.confirm({
                content: 'Are you sure you want to reroll how much HP you gain from this rank?',
                rejectClose: false,
                modal: true,
            });
            if (proceed) {
                const hitDie = this.item.system.hitDie;
                const maxRoll = parseInt(hitDie.slice(1), 10);
                const newHp = Math.floor(Math.random() * maxRoll) + 1;
                this.item.update({ 'system.hp': newHp });
            }
        });
        this.element.querySelector('.mana-die-box').addEventListener('click', async (event) => {
            const proceed = await DialogV2.confirm({
                content: 'Are you sure you want to reroll how much mana you gain from this rank?',
                rejectClose: false,
                modal: true,
            });
            if (proceed) {
                const manaDie = this.item.system.manaDie;
                const maxRoll = parseInt(manaDie.slice(1), 10);
                const newMana = Math.floor(Math.random() * maxRoll) + 1;
                this.item.update({ 'system.mana': newMana });
            }
        });
    }
}