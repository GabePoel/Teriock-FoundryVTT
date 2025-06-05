/**
 * A custom Roll class which enriches the provided flavor and uses a custom chat template to display the flavor as enriched HTML.
 * 
 * @class
 * @extends Roll
 */
export default class TeriockRoll extends Roll {
  static CHAT_TEMPLATE = 'systems/teriock/templates/chat/roll.hbs';

  /** @override */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    const defaultOptions = {
      enrich: false,
    }
    options = foundry.utils.mergeObject(defaultOptions, options);
    if (options.enrich && options.message) {
      foundry.applications.ux.TextEditor.enrichHTML(options.message).then(html => {
        options.message = html;
      });
    }
    if (options.message) {
      this.message = options.message;
    }
    if (options.context) {
      this.context = options.context;
    }
  }

  /** @override */
  async _prepareChatRenderContext({flavor, isPrivate=false, ...options}={}) {
    const context = await super._prepareChatRenderContext({flavor, isPrivate, ...options});
    context.message = this.message;
    if (this.context) {
      Object.assign(context, this.context);
    }
    return context;
  }
}