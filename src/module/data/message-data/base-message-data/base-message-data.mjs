import { imageContextMenuOptions } from "../../../applications/sheets/misc-sheets/image-sheet/connections/_context-menus.mjs";
import { handlers } from "../../../helpers/action-handler/instances/_handlers.mjs";
import { buildHTMLButton } from "../../../helpers/html.mjs";

const { ux } = foundry.applications;
const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

export default class TeriockBaseMessageData extends TypeDataModel {
  /**
   * Blank metadata.
   * @returns {object} The metadata object.
   */
  static get metadata() {
    return foundry.utils.mergeObject({}, { type: "base" });
  }

  /**
   * No default schema.
   * @returns {object}
   */
  static defineSchema() {
    const schema = {};
    schema.columns = new fields.NumberField({ initial: 2 });
    schema.overlay = new fields.HTMLField({ nullable: true, initial: null });
    schema.buttons = new fields.ArrayField(
      new fields.SchemaField({
        label: new fields.StringField(),
        dataset: new fields.TypedObjectField(new fields.StringField()),
        classes: new fields.SetField(new fields.StringField(), {
          initial: ["teriock-chat-button"],
        }),
        icon: new fields.StringField(),
        type: new fields.StringField(),
        disabled: new fields.BooleanField(),
      }),
    );
    schema.tags = new fields.ArrayField(new fields.StringField());
    schema.extraContent = new fields.HTMLField();
    schema.source = new fields.DocumentUUIDField({ nullable: true });
    return schema;
  }

  /**
   * Perform subtype-specific alterations to the final chat message html
   * @param {HTMLLIElement} html The pending HTML
   */
  async alterMessageHTML(html) {
    html.classList.add("teriock");

    // Add extra content div at the start of message-content if it exists
    if (this.extraContent) {
      const messageContent = html.querySelector(".message-content");
      if (messageContent) {
        const extraContentDiv = document.createElement("div");
        extraContentDiv.classList.add("extra-content");
        extraContentDiv.innerHTML = this.extraContent;
        messageContent.insertAdjacentElement("afterbegin", extraContentDiv);
      }
    }

    const hasContent =
      (this.tags && this.tags.length > 0) || this.buttons.length > 0;
    if (hasContent) {
      const footer = this._constructFooter();
      html.insertAdjacentElement("beforeend", footer);
    }

    if (this.overlay) {
      const overlay = document.createElement("div");
      overlay.innerHTML = this.overlay;
      html.insertAdjacentElement("afterbegin", overlay.firstElementChild);
      html.style.position = "relative";
    }

    this.addListeners(html);
  }

  /**
   * Construct the footer element with tags and buttons
   * @returns {HTMLElement} The footer element
   * @protected
   */
  _constructFooter() {
    const footer = document.createElement("footer");
    footer.className = "teriock-message-footer";

    // Create and add tag container
    const tagContainer = this._createTagContainer();
    if (tagContainer) {
      footer.appendChild(tagContainer);
    }

    // Create and add button container
    const buttonContainer = this._createButtonContainer();
    if (buttonContainer) {
      footer.appendChild(buttonContainer);
    }

    return footer;
  }

  /**
   * Create the tag container element
   * @returns {HTMLElement|null} The tag container element or null if no tags
   * @protected
   */
  _createTagContainer() {
    if (!this.tags || this.tags.length === 0) return null;

    const messageElement = document.createElement("div");
    messageElement.className = "tmessage teriock-bottom-tags";

    const barBox = document.createElement("div");
    barBox.className = "tmes-bar-box";

    const bar = document.createElement("div");
    bar.className = "abm-bar";

    const tags = document.createElement("div");
    tags.className = "abm-bar-tags";

    for (const tag of this.tags) {
      const labelDiv = document.createElement("div");
      labelDiv.className = "abm-label tsubtle";
      labelDiv.textContent = tag;
      tags.appendChild(labelDiv);
    }

    bar.appendChild(tags);
    barBox.appendChild(bar);
    messageElement.appendChild(barBox);

    return messageElement;
  }

  /**
   * Create the button container with grid layout
   * @returns {HTMLElement|null} The button container element or null if no buttons
   * @protected
   */
  _createButtonContainer() {
    const buttons = this._constructFooterButtons();
    if (buttons.length === 0) return null;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("teriock-buttons");

    const totalButtons = buttons.length;
    const columns = this.columns;
    const remainder = totalButtons % columns;

    if (remainder === 0) {
      // Clean multiple - all buttons same width
      buttonContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      buttons.forEach((button) => {
        button.classList.remove("full-width", "full-row");
        buttonContainer.appendChild(button);
      });
    } else {
      // Uneven distribution - top row gets special treatment
      const topRowButtons = remainder;
      const topRowButtonWidth = columns / topRowButtons;

      // Set up grid for the full layout
      buttonContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

      // Add top row buttons with special spanning
      for (let i = 0; i < topRowButtons; i++) {
        const button = buttons[i];
        button.classList.remove("full-width", "full-row");
        button.style.gridColumn = `span ${topRowButtonWidth}`;
        buttonContainer.appendChild(button);
      }

      // Add remaining buttons in normal grid
      for (let i = topRowButtons; i < totalButtons; i++) {
        const button = buttons[i];
        button.classList.remove("full-width", "full-row");
        buttonContainer.appendChild(button);
      }
    }

    return buttonContainer;
  }

  /**
   * Build an array of buttons to insert into the footer of the document
   * @returns {HTMLButtonElement[]}
   * @protected
   */
  _constructFooterButtons() {
    return this.buttons.map((button) => buildHTMLButton(button));
  }

  /**
   * Add event listeners. Guaranteed to run after all alterations in {@link alterMessageHTML}.
   * @param {HTMLLIElement} html The pending HTML
   */
  addListeners(html) {
    new ux.ContextMenu(html, ".timage", imageContextMenuOptions, {
      eventName: "contextmenu",
      jQuery: false,
      fixed: true,
    });

    const actionElements = html.querySelectorAll("[data-action]");
    for (const /** @type {HTMLElement} */ element of actionElements) {
      const action = element.dataset.action;

      const HandlerClass = Object.values(handlers).find(
        (cls) => cls.ACTION === action,
      );

      if (!HandlerClass) {
        continue;
      }

      element.addEventListener("click", async (event) => {
        const handler = /** @type {ActionHandler} */ new HandlerClass(
          event,
          element,
        );
        await handler.primaryAction();
      });

      element.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
        const handler = /** @type {ActionHandler} */ new HandlerClass(
          event,
          element,
        );
        await handler.secondaryAction();
      });
    }
  }
}
