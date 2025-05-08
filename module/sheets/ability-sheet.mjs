import { openWikiPage } from "../helpers/wiki.mjs";
import { contextMenus } from "./context-menus/ability-context-menus.mjs";
import { TeriockItemSheet } from './item-sheet.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {TeriockItemSheet}
 */
export class AbilitySheet extends TeriockItemSheet {
    /** @override */
    constructor(...args) {
        super(...args);
        this._menuOpen = false;
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['teriock', 'sheet', 'item'],
            width: 520,
            height: 480,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'description',
                },
            ],
        });
    }

    /* -------------------------------------------- */

    /** @override */
    async getData() {
        // Retrieve base data structure.
        const context = super.getData();
        const system = this.item.system

        // Use a safe clone of the item data for further operations.
        const itemData = this.document.toObject(false);


        // Enrich description info for display

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
        context.system = itemData.system;
        context.flags = itemData.flags;

        // Adding a pointer to CONFIG.TERIOCK
        context.config = CONFIG.TERIOCK;

        return context;
    }

    /* -------------------------------------------- */


    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Attach listeners to HTML elements
        this._activateContextMenus(html);
        this._activateTags(html);
        this._activateMenu(html);

        html.on('click', '.reload-button', async (event) => {
            event.preventDefault();
            await this.item._wikiPull();
        });
        html.on('contextmenu', '.reload-button', async (event) => {
            event.preventDefault();
            console.log(this.item);
        });

        html.on('click', '.open-button', (event) => {
            event.preventDefault();
            console.log('Opening wiki page');
            openWikiPage('Ability:' + this.item.name);
        });
        html.on('click', '.chat-button', (event) => {
            event.preventDefault();
            this.item.share();
        });
    }

    /* Helpers */
    /* -------------------------------------------- */

    _activateContextMenus(html) {
        function _connectContextMenu(cssClass, options, eventName) {
            new foundry.applications.ux.ContextMenu(html[0], cssClass, options, {
                eventName: eventName,
            });
        }
        const cm = contextMenus(this.item);
        console.log(cm);
        _connectContextMenu('.delivery-box', cm.delivery, 'click');
        _connectContextMenu('.delivery-box', cm.piercing, 'contextmenu');
        _connectContextMenu('.execution-box', cm.maneuver, 'contextmenu');
        _connectContextMenu('.execution-box[maneuver="Active"]', cm.active, 'click');
        _connectContextMenu('.execution-box[maneuver="Reactive"]', cm.reactive, 'click');
        _connectContextMenu('.interaction-box', cm.interaction, 'click');
        _connectContextMenu('.interaction-box-feat', cm.featSaveAttribute, 'contextmenu');
        _connectContextMenu('.target-box', cm.targets, 'click');
        _connectContextMenu('.mana-cost-box', cm.manaCost, 'contextmenu');
        _connectContextMenu('.hit-cost-box', cm.hitCost, 'contextmenu');
        _connectContextMenu('.break-cost-box', cm.breakCost, 'contextmenu');
        _connectContextMenu('.expansion-box', cm.expansion, 'click');
        _connectContextMenu('.expansion-box-detonate', cm.expansionSaveAttribute, 'contextmenu');
        _connectContextMenu('.expansion-box-ripple', cm.expansionSaveAttribute, 'contextmenu');
        _connectContextMenu('.ab-improvement-attribute', cm.attributeImprovement, 'click');
        _connectContextMenu('.ab-improvement-attribute', cm.attributeImprovementMinVal, 'contextmenu');
        _connectContextMenu('.ab-improvement-feat-save', cm.featSaveImprovement, 'click');
        _connectContextMenu('.ab-improvement-feat-save', cm.featSaveImprovementAmount, 'contextmenu');
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
        html.on('click', '.element-tag', (event) => {
            event.preventDefault();
            const element = event.currentTarget.getAttribute('value');
            const elements = this.item.system.elements.filter(e => e !== element);
            this.item.update({ 'system.elements': elements });
        });
        html.on('click', '.power-tag', (event) => {
            event.preventDefault();
            const power = event.currentTarget.getAttribute('value');
            const powers = this.item.system.powerSources.filter(e => e !== power);
            this.item.update({ 'system.powerSources': powers });
        });
        html.on('click', '.effect-tag', (event) => {
            event.preventDefault();
            const effect = event.currentTarget.getAttribute('value');
            const effects = this.item.system.effects.filter(e => e !== effect);
            this.item.update({ 'system.effects': effects });
        });

        html.on('click', '.ab-expansion-button', (event) => {
            event.preventDefault();
            this.item.update({ 'system.expansion': 'detonate' });
        });
        html.on('click', '.ab-mana-cost-button', (event) => {
            event.preventDefault();
            this.item.update({ 'system.costs.mp': 1 });
        });
        html.on('click', '.ab-hit-cost-button', (event) => {
            event.preventDefault();
            this.item.update({ 'system.costs.hp': 1 });
        });
        html.on('click', '.ab-break-cost-button', (event) => {
            event.preventDefault();
            this.item.update({ 'system.costs.break': 'shatter' });
        });
        html.on('click', '.ab-attribute-improvement-button', (event) => {
            event.preventDefault();
            this.item.update({ 'system.improvements.attributeImprovement.attribute': 'int' });
        });
        html.on('click', '.ab-feat-save-improvement-button', (event) => {
            event.preventDefault();
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
        const menu = html.find('.ab-menu')[0];
        const menuToggle = html.find('.ab-menu-toggle')[0];
        if (menu && this._menuOpen) {
            menu.classList.add('no-transition');
            menu.classList.add('ab-menu-open');
            menu.offsetHeight;
            menu.classList.remove('no-transition');
            menuToggle.classList.add('ab-menu-toggle-open');
        }
        html.on('click', '.ab-menu-toggle', (event) => {
            event.preventDefault();
            this._menuOpen = !this._menuOpen;
            if (menu) {
                menu.classList.toggle('ab-menu-open', this._menuOpen);
                menuToggle.classList.toggle('ab-menu-toggle-open', this._menuOpen);
                if (this._menuOpen) {
                    html.on('click', '.ab-main', (event) => {
                        event.preventDefault();
                        this._menuOpen = false;
                        menu.classList.remove('ab-menu-open');
                        menuToggle.classList.remove('ab-menu-toggle-open');
                        html.off('click', '.ab-main');

                    });
                } else {
                    html.off('click', '.ab-main');
                }
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