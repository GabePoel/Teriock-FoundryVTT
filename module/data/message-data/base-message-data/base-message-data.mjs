const { TypeDataModel } = foundry.abstract;

export default class TeriockBaseMessageData extends TypeDataModel {
  /**
   * Blank metadata.
   *
   * @returns {object} The metadata object.
   */
  static get metadata() {
    return foundry.utils.mergeObject({}, { type: "base" });
  }

  /**
   * No default schema.
   *
   * @returns {object}
   */
  static defineSchema() {
    return {};
  }

  /**
   * Perform subtype-specific alterations to the final chat message html
   * Called by the renderChatMessageHTML hook
   *
   * @param {HTMLLIElement} html The pending HTML
   */
  async alterMessageHTML(html) {
    const footerButtons = await this._constructFooterButtons();
    if (footerButtons.length) {
      const footer = document.createElement("footer");
      footer.append(...footerButtons);
      html.insertAdjacentElement("beforeend", footer);
    }
  }

  /**
   * Build an array of buttons to insert into the footer of the document
   * @returns {HTMLButtonElement[]}
   * @protected
   */
  async _constructFooterButtons() {
    return [];
  }

  /**
   * Add event listeners. Guaranteed to run after all alterations in {@link alterMessageHTML}
   * Called by the renderChatMessageHTML hook
   * @param {HTMLLIElement} html The pending HTML
   */
  addListeners(html) {}
}
