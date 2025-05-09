const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from './teriock-item-sheet.mjs';
import { rankContextMenu, classContextMenu, archetypeContextMenu } from './context-menus/rank-context-menus.mjs';

export class TeriockRankSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'rank', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            onChat: this._onChat,
            viewDoc: this._viewDoc,
        },
        form: {
            submitOnChange: true,
        },
    };
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/parts/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/rank-template.hbs',
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
    }

    static async _viewDoc(event, target) {
        const id = target.parentElement.getAttribute('data-item-id');
        const ability = await game.packs.get(this.item.system.sourcePack).getDocument(id);
        ability.sheet.render(true);
    }
}