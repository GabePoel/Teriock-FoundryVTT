import { parseIdentifier } from "../../helpers/utils.mjs";

const { TextEditor } = foundry.applications.ux;

export default class TeriockTextEditor extends TextEditor {
  /**
   * Localized HTML string to represent a loading panel.
   * @returns {string}
   */
  static get loadingPanelHTML() {
    return TERIOCK.display.panel.loading.replace("TERIOCK.LOADING", _loc("TERIOCK.TERMS.Common.loading"));
  }

  /**
   * Patched to allow for identifiers as well as UUIDs.
   * @inheritDoc
   */
  static async _embedContent(match, options = {}) {
    for (const part of match.groups.config.match(/(?:[^\s"]+|"[^"]*")+/g)) {
      const [key] = part.split("=");
      if (key === "identifier" || parseIdentifier(part)) await game.teriock.identifiers.ready;
    }
    return super._embedContent(match, options);
  }

  /**
   * Patched to allow for identifiers as well as UUIDs.
   * @inheritDoc
   * @returns {DocumentHTMLEmbedConfig & { identifier?: TypedIdentifier }}
   */
  static _parseEmbedConfig(raw, options = {}) {
    /** @type {DocumentHTMLEmbedConfig & { identifier?: TypedIdentifier }} */
    const config = super._parseEmbedConfig(raw, options);
    if (!config.uuid) {
      if (config.identifier) config.uuid = game.teriock.identifiers.get(config.identifier);
      else if (config.values.length && parseIdentifier(config.values[0])) {
        const uuid = game.teriock.identifiers.get(config.values[0]);
        if (uuid) config.uuid = uuid;
      }
    }
    return config;
  }

  /**
   * Enrich all the blocks within a panel.
   * @param {Teriock.Messages.MessagePanel} panel
   * @param {object} [options]
   * @returns {Promise<Teriock.Messages.MessagePanel>}
   */
  static async enrichPanel(panel, options = {}) {
    await Promise.all((panel.blocks ?? []).map(async (b) => b.text = await this.enrichHTML(b.text, options)));
    for (const association of panel.associations ?? []) {
      for (const card of association.cards ?? [])
        if (card.uuid && card.makeTooltip) card.tooltip = foundry.utils.escapeHTML(this.loadingPanelHTML);
    }
    return panel;
  }

  /**
   * Enrich an array of panels.
   * @param {Teriock.Messages.MessagePanel[]} panels
   * @param {object} [options]
   * @returns {Promise<Teriock.Messages.MessagePanel[]>}
   */
  static async enrichPanels(panels, options = {}) {
    return Promise.all(panels.map(p => this.enrichPanel(p, options)));
  }

  /**
   * Convert the panel to an HTML string.
   * @param {Teriock.Messages.MessagePanel} parts
   * @param {object} [options]
   * @param {boolean} [options.noBars]
   * @param {boolean} [options.noBlocks]
   * @param {boolean} [options.noAssociations]
   * @returns {Promise<string>}
   */
  static async makeTooltip(parts, options = {}) {
    if (options.noBars) delete parts.bars;
    if (options.noBlocks) delete parts.blocks;
    if (options.noAssociations) delete parts.associations;
    await this.enrichPanel(parts, options);
    return this.renderTemplate("teriock/ui/panel", parts);
  }

  /**
   * A wrapper for rendering templates with handlebars that ensures `TERIOCK` is always available.
   * @param {string} path
   * @param {object} data
   * @returns {Promise<string>}
   */
  static async renderTemplate(path, data) {
    return foundry.applications.handlebars.renderTemplate(path, { ...data, TERIOCK });
  }
}
