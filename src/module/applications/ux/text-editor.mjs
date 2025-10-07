import { systemPath } from "../../helpers/path.mjs";

const { TextEditor } = foundry.applications.ux;

/** @inheritDoc */
export default class TeriockTextEditor extends TextEditor {
  /**
   * Enrich all the blocks within a panel.
   * @param {Teriock.MessageData.MessageParts} parts
   * @returns {Promise<Teriock.MessageData.MessageParts>}
   */
  static async enrichPanel(parts) {
    for (const block of parts.blocks || []) {
      block.text = await this.enrichHTML(block.text);
    }
    return parts;
  }

  /**
   * Convert the panel to an HTML string.
   * @param {Teriock.MessageData.MessageParts} parts
   * @returns {Promise<string>}
   */
  static async makeTooltip(parts) {
    await this.enrichPanel(parts);
    return await foundry.applications.handlebars.renderTemplate(
      systemPath("templates/message-templates/panel.hbs"),
      parts,
    );
  }
}
