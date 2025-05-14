/**
 * A custom Roll class which enriches the provided flavor and uses a custom chat template to display the flavor as enriched HTML.
 * 
 * @class
 * @extends Roll
 */
export class TeriockRoll extends Roll {
    static CHAT_TEMPLATE = 'systems/teriock/templates/chat/roll.hbs';

    /** @override */
    constructor(formula, data, options = {}) {
        const defaultOptions = {
            enrich: false,
        }
        options = mergeObject(defaultOptions, options);
        if (options.enrich && options.flavor) {
            foundry.applications.ux.TextEditor.enrichHTML(options.flavor).then(html => {
                options.flavor = html;
            });
        }
        super(formula, data, options);
    }
}