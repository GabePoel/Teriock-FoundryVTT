import { systemPath } from "../../helpers/path.mjs";

const { TextEditor } = foundry.applications.ux;

export default class TeriockTextEditor extends TextEditor {
  /**
   * Enrich all the blocks within a panel.
   * @param {Teriock.MessageData.MessagePanel} panel
   * @returns {Promise<Teriock.MessageData.MessagePanel>}
   */
  static async enrichPanel(panel) {
    for (const block of panel.blocks || []) {
      block.text = await this.enrichHTML(block.text);
    }
    for (const association of panel.associations || []) {
      for (const card of association.cards || []) {
        if (card.uuid) {
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
   * @returns {Promise<Teriock.MessageData.MessagePanel[]>}
   */
  static async enrichPanels(panels) {
    for (const panel of panels) {
      await this.enrichPanel(panel);
    }
    return panels;
  }

  /**
   * Convert the panel to an HTML string.
   * @param {Teriock.MessageData.MessagePanel} parts
   * @returns {Promise<string>}
   */
  static async makeTooltip(parts) {
    await this.enrichPanel(parts);
    return await foundry.applications.handlebars.renderTemplate(
      systemPath("templates/ui-templates/panel.hbs"),
      parts,
    );
  }
}
