import { systemPath } from "../../helpers/path.mjs";

const { TextEditor } = foundry.applications.ux;

export default class TeriockTextEditor extends TextEditor {
  /**
   * Enrich all the blocks within a panel.
   * @param {Teriock.MessageData.MessagePanel} panel
   * @param {object} [options]
   * @returns {Promise<Teriock.MessageData.MessagePanel>}
   */
  static async enrichPanel(panel, options = {}) {
    for (const block of panel.blocks || []) {
      block.text = await this.enrichHTML(block.text, options);
    }
    for (const association of panel.associations || []) {
      for (const card of association.cards || []) {
        if (card.uuid && card.makeTooltip) {
          card.tooltip = foundry.utils.escapeHTML(
            TERIOCK.display.panel.loading,
          );
        }
      }
    }
    return panel;
  }

  /**
   * Enrich an array of panels.
   * @param {Teriock.MessageData.MessagePanel[]} panels
   * @param {object} [options]
   * @returns {Promise<Teriock.MessageData.MessagePanel[]>}
   */
  static async enrichPanels(panels, options = {}) {
    for (const panel of panels) {
      await this.enrichPanel(panel, options);
    }
    return panels;
  }

  /**
   * Convert the panel to an HTML string.
   * @param {Teriock.MessageData.MessagePanel} parts
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
    return await this.renderTemplate(
      systemPath("templates/ui-templates/panel.hbs"),
      parts,
    );
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
