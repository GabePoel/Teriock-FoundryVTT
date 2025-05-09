const { api } = foundry.applications
import { contextMenus } from "./context-menus/ability-context-menus.mjs";
import { TeriockItemSheet } from "./teriock-item-sheet.mjs";

export class TeriockAbilitySheet extends api.HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
        },
        form: {
            submitOnChange: true,
        }
    }
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/parts/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/ability-template.hbs',
        },
    }

    /** @override */
    constructor(...args) {
        super(...args);
        this._menuOpen = false;
    }

    /* -------------------------------------------- */

    async _editor(parameter) {
        return await foundry.applications.ux.TextEditor.enrichHTML(parameter, {
            relativeTo: this.item,
        });
    }

    /** @override */
    async _prepareContext() {
        const context = {}
        const system = this.item.system

        // Before Overview
        context.manaCost = await this._editor(system.costs.manaCost);
        context.hitCost = await this._editor(system.costs.hitCost);
        context.materialCost = await this._editor(system.costs.materialCost);
        context.trigger = await this._editor(system.trigger);

        // Overview
        context.baseOverview = await this._editor(system.overview.base);

        // After Overview
        context.proficientOverview = await this._editor(system.overview.proficient);
        context.fluentOverview = await this._editor(system.overview.fluent);
        context.heightened = await this._editor(system.heightened);

        // Attack
        context.onCriticalHit = await this._editor(system.results.critHit);
        context.onHit = await this._editor(system.results.hit);
        context.onMiss = await this._editor(system.results.miss);
        context.onCriticalMiss = await this._editor(system.results.critMiss);

        // Feat
        context.onCriticalFail = await this._editor(system.results.critFail);
        context.onFail = await this._editor(system.results.fail);
        context.onSave = await this._editor(system.results.save);
        context.onCriticalSave = await this._editor(system.results.critSave);

        // Other
        context.endCondition = await this._editor(system.endCondition);
        context.requirements = await this._editor(system.requirements);

        // Add the item's data to context.data for easier access, as well as flags.
        // context.item = this.item;
        context.system = this.item.system;
        context.flags = this.item.flags;

        // Adding a pointer to CONFIG.TERIOCK
        context.config = CONFIG.TERIOCK;
        context.item = this.item;

        context.editable = this.isEditable;
        context.owner = this.document.isOwner;
        context.limited = this.document.limited;

        console.log(context);

        return context;
    }

    /* -------------------------------------------- */

    _connect(cssClass, listener, callback) {
        const elements = this.element.querySelectorAll(cssClass);
        elements.forEach((element) => {
            element.addEventListener(listener, (event) => {
                event.preventDefault();
                callback(event);
            });
        });
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        const html = $(this.element);
        console.log(html);

        // Attach listeners to HTML elements
        this._activateContextMenus(html);
        this._activateTags(html);
        this._activateMenu(html);
    }

    /* Helpers */
    /* -------------------------------------------- */

    static async _onEditImage(event, target) {
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document, attr);
        const { img } =
            this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
            {};
        const fp = new FilePicker({
            current,
            type: 'image',
            redirectToRoot: img ? [img] : [],
            callback: (path) => {
                this.document.update({ [attr]: path });
            },
            top: this.position.top + 40,
            left: this.position.left + 10,
        });
        return fp.browse();
    }

    _activateContextMenus() {
        const cm = contextMenus(this.item);
        // console.log(cm);
        this._connectContextMenu('.delivery-box', cm.delivery, 'click');
        this._connectContextMenu('.delivery-box', cm.piercing, 'contextmenu');
        this._connectContextMenu('.execution-box', cm.maneuver, 'contextmenu');
        this._connectContextMenu('.execution-box[maneuver="Active"]', cm.active, 'click');
        this._connectContextMenu('.execution-box[maneuver="Reactive"]', cm.reactive, 'click');
        this._connectContextMenu('.interaction-box', cm.interaction, 'click');
        this._connectContextMenu('.interaction-box-feat', cm.featSaveAttribute, 'contextmenu');
        this._connectContextMenu('.target-box', cm.targets, 'click');
        this._connectContextMenu('.mana-cost-box', cm.manaCost, 'contextmenu');
        this._connectContextMenu('.hit-cost-box', cm.hitCost, 'contextmenu');
        this._connectContextMenu('.break-cost-box', cm.breakCost, 'contextmenu');
        this._connectContextMenu('.expansion-box', cm.expansion, 'click');
        this._connectContextMenu('.expansion-box-detonate', cm.expansionSaveAttribute, 'contextmenu');
        this._connectContextMenu('.expansion-box-ripple', cm.expansionSaveAttribute, 'contextmenu');
        this._connectContextMenu('.ab-improvement-attribute', cm.attributeImprovement, 'click');
        this._connectContextMenu('.ab-improvement-attribute', cm.attributeImprovementMinVal, 'contextmenu');
        this._connectContextMenu('.ab-improvement-feat-save', cm.featSaveImprovement, 'click');
        this._connectContextMenu('.ab-improvement-feat-save', cm.featSaveImprovementAmount, 'contextmenu');
    }

    _activateTags(html) {
        const ability = this.item;
        function _connectTag(cssClass, parameter) {
            html.on('click', cssClass, (event) => {
                event.preventDefault();
                ability.update({ [parameter]: false });
            });
        }
        _connectTag('.flag-tag-basic', 'system.basic');
        _connectTag('.flag-tag-sustained', 'system.sustained');
        _connectTag('.flag-tag-standard', 'system.standard');
        _connectTag('.flag-tag-skill', 'system.skill');
        _connectTag('.flag-tag-spell', 'system.spell');
        _connectTag('.flag-tag-ritual', 'system.ritual');
        _connectTag('.flag-tag-rotator', 'system.rotator');
        _connectTag('.flag-tag-invoked', 'system.costs.invoked');
        _connectTag('.flag-tag-verbal', 'system.costs.verbal');
        _connectTag('.flag-tag-somatic', 'system.costs.somatic');
        this._connect('.element-tag', 'click', (event) => {
            const element = event.currentTarget.getAttribute('value');
            const elements = this.item.system.elements.filter(e => e !== element);
            this.item.update({ 'system.elements': elements });
        });
        this._connect('.power-tag', 'click', (event) => {
            const power = event.currentTarget.getAttribute('value');
            const powers = this.item.system.powerSources.filter(e => e !== power);
            this.item.update({ 'system.powerSources': powers });
        });
        this._connect('.effect-tag', 'click', (event) => {
            const effect = event.currentTarget.getAttribute('value');
            const effects = this.item.system.effects.filter(e => e !== effect);
            this.item.update({ 'system.effects': effects });
        });
        this._connect('.ab-expansion-button', 'click', (event) => {
            this.item.update({ 'system.expansion': 'detonate' });
        });
        this._connect('.ab-mana-cost-button', 'click', (event) => {
            this.item.update({ 'system.costs.mp': 1 });
        });
        this._connect('.ab-hit-cost-button', 'click', (event) => {
            this.item.update({ 'system.costs.hp': 1 });
        });
        this._connect('.ab-break-cost-button', 'click', (event) => {
            this.item.update({ 'system.costs.break': 'shatter' });
        });
        this._connect('.ab-attribute-improvement-button', 'click', (event) => {
            this.item.update({ 'system.improvements.attributeImprovement.attribute': 'int' });
        });
        this._connect('.ab-feat-save-improvement-button', 'click', (event) => {
            this.item.update({ 'system.improvements.featSaveImprovement.attribute': 'int' });
        });
    }

    _activateMenu(html) {
        const ability = this.item;
        function _connectButton(cssClass, parameter) {
            html.on('click', cssClass, (event) => {
                event.preventDefault();
                const text = 'Insert effect here.';
                const update = {};
                update[parameter] = text;
                ability.update(update);
            });
        }

        const menu = this.element.querySelector('.ab-menu');
        const menuToggle = this.element.querySelector('.ab-menu-toggle');
        if (menu && this._menuOpen) {
            menu.classList.add('no-transition');
            menu.classList.add('ab-menu-open');
            menu.offsetHeight;
            menu.classList.remove('no-transition');
            menuToggle.classList.add('ab-menu-toggle-open');
        }
        this.element.querySelector('.ab-menu-toggle').addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Menu toggle clicked');
            console.log(this._menuOpen);
            this._menuOpen = !this._menuOpen;
            if (menu) {
                console.log('Menu open:', this._menuOpen);
                menu.classList.toggle('ab-menu-open', this._menuOpen);
                menuToggle.classList.toggle('ab-menu-toggle-open', this._menuOpen);
            }
        });

        _connectButton('.ab-trigger-button', 'system.trigger');

        // Overview
        _connectButton('.ab-base-button', 'system.overview.base');

        // After Overview
        _connectButton('.ab-proficient-button', 'system.overview.proficient');
        _connectButton('.ab-fluent-button', 'system.overview.fluent');
        _connectButton('.ab-heightened-button', 'system.heightened');

        // Attack
        _connectButton('.ab-crit-hit-button', 'system.results.critHit');
        _connectButton('.ab-hit-button', 'system.results.hit');
        _connectButton('.ab-miss-button', 'system.results.miss');
        _connectButton('.ab-crit-miss-button', 'system.results.critMiss');

        // Feat
        _connectButton('.ab-crit-fail-button', 'system.results.critFail');
        _connectButton('.ab-fail-button', 'system.results.fail');
        _connectButton('.ab-save-button', 'system.results.save');
        _connectButton('.ab-crit-save-button', 'system.results.critSave');

        // Other
        _connectButton('.ab-end-condition-button', 'system.endCondition');
        _connectButton('.ab-requirements-button', 'system.requirements');
    }
}