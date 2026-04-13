const { TextEditor } = foundry.applications.ux;

export default class TeriockTextEditor extends TextEditor {
  /**
   * Localized HTML string to represent a loading panel.
   * @returns {string}
   */
  static get loadingPanelHTML() {
    return TERIOCK.display.panel.loading.replace(
      "TERIOCK.LOADING",
      _loc("TERIOCK.TERMS.Common.loading"),
    );
  }

  /**
   * Enrich all the blocks within a panel.
   * @param {Teriock.Messages.MessagePanel} panel
   * @param {object} [options]
   * @returns {Promise<Teriock.Messages.MessagePanel>}
   */
  static async enrichPanel(panel, options = {}) {
    for (const block of panel.blocks || []) {
      block.text = await this.enrichHTML(block.text, options);
    }
    for (const association of panel.associations || []) {
      for (const card of association.cards || []) {
        if (card.uuid && card.makeTooltip) {
          card.tooltip = foundry.utils.escapeHTML(this.loadingPanelHTML);
        }
      }
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
    for (const panel of panels) {
      await this.enrichPanel(panel, options);
    }
    return panels;
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
    return await this.renderTemplate("teriock/ui/panel", parts);
  }

  /**
   * A wrapper for rendering templates with handlebars that ensures `TERIOCK` is always available.
   * @param {string} path
   * @param {object} data
   * @returns {Promise<string>}
   */
  static async renderTemplate(path, data) {
    return await foundry.applications.handlebars.renderTemplate(path, {
      ...data,
      TERIOCK,
    });
  }
}
