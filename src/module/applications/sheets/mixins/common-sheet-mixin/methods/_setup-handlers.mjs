/**
 * Sets up all event listeners for the sheet.
 * Configures handlers for form updates, record fields, set fields, array fields, and changes.
 * @param {DocumentSheetV2} sheet
 */
export default async function _setupEventListeners(sheet) {
  setupUpdateHandlers(sheet);
  setupRecordFieldHandlers(sheet);
  setupChangeHandlers(sheet);
}

/**
 * Sets up update handlers for various input types.
 * Configures change and click handlers for update inputs, select elements, and checkboxes.
 * @param {DocumentSheetV2} sheet
 */
function setupUpdateHandlers(sheet) {
  const handlers = [
    {
      selector: ".teriock-update-input",
      event: "change",
    },
    {
      selector: ".teriock-update-select",
      event: "change",
    },
    {
      selector: ".teriock-update-checkbox",
      event: "click",
      getValue: (el) => el.checked,
    },
  ];

  handlers.forEach(({ selector, event, getValue }) => {
    sheet.element.querySelectorAll(selector).forEach((el) => {
      const name = el.getAttribute("name");
      if (!name) {
        return;
      }

      el.addEventListener(event, async (e) => {
        if (event === "click") {
          e.preventDefault();
        }
        const target = /** @type {HTMLFormElement} */ e.currentTarget;

        const value = getValue
          ? getValue(target)
          : (target.value ?? target.getAttribute("data-value"));

        await sheet.document.update({ [name]: value });
      });
    });
  });
}

/**
 * Sets up handlers for record field components.
 * Configures multi-select inputs and remove buttons for record fields.
 * @param {DocumentSheetV2} sheet
 */
function setupRecordFieldHandlers(sheet) {
  sheet.element
    .querySelectorAll(".teriock-record-field")
    .forEach((container) => {
      const select = container.querySelector("select");
      if (!select) {
        return;
      }

      const name = container.getAttribute("name");
      const allowedKeys = Array.from(select.options)
        .map((option) => option.value)
        .filter((value) => value !== "");

      select.addEventListener("input", async () => {
        await addToRecordField(sheet, name, select.value, allowedKeys);
      });

      container.querySelectorAll(".remove").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = /** @type {HTMLElement} */ e.currentTarget;
          const closest = /** @type {HTMLElement} */ target.closest(".tag");
          const key = closest.dataset.key;
          await cleanRecordField(
            sheet,
            name,
            allowedKeys.filter((k) => k !== key),
          );
        });
      });
    });
}

/**
 * Sets up handlers for change field components.
 * Configures change inputs and remove buttons for change arrays.
 * @param {DocumentSheetV2} sheet
 */
function setupChangeHandlers(sheet) {
  // Change inputs
  sheet.element.querySelectorAll(".teriock-change-input").forEach(
    /** @param {HTMLElement} el */ (el) => {
      const { name } = el.attributes;
      const { index, part } = el.dataset;
      if (!name?.value) {
        return;
      }

      el.addEventListener("change", async (e) => {
        const existing = foundry.utils.getProperty(sheet.document, name.value);
        const copy = foundry.utils.deepClone(existing) || [];
        copy[index][part] = e.currentTarget.value;
        await sheet.document.update({ [name.value]: copy });
      });
    },
  );

  // Remove change buttons
  sheet.element.querySelectorAll(".teriock-remove-change-button").forEach(
    /** @param {HTMLButtonElement} button */ (button) => {
      const { name } = button.attributes;
      const { index } = button.dataset;

      button.addEventListener("click", async () => {
        const existing = foundry.utils.getProperty(sheet.document, name.value);
        const copy = foundry.utils.deepClone(existing) || [];
        copy.splice(index, 1);
        await sheet.document.update({ [name.value]: copy });
      });
    },
  );
}

/**
 * Adds a key to a record field with validation.
 * @param {DocumentSheetV2} sheet
 * @param {string} name - The field name.
 * @param {string} key - The key to add.
 * @param {Array} allowedKeys - Array of allowed keys.
 * @returns {Promise<void>} Promise that resolves when the field is updated.
 */
async function addToRecordField(sheet, name, key, allowedKeys = []) {
  const existing = foundry.utils.getProperty(sheet.document, name);
  const copy = foundry.utils.deepClone(existing) || {};
  const updateData = {};

  // Remove invalid keys
  Object.keys(copy).forEach((k) => {
    if (k !== key && !allowedKeys.includes(k)) {
      updateData[`${name}.-=${k}`] = null;
    }
  });

  updateData[`${name}.${key}`] = null;
  await sheet.document.update(updateData);
}

/**
 * Cleans a record field by removing invalid keys.
 * @param {DocumentSheetV2} sheet
 * @param {string} name - The field name.
 * @param {Array} allowedKeys - Array of allowed keys to keep.
 * @returns {Promise<void>} Promise that resolves when the field is cleaned.
 */
async function cleanRecordField(sheet, name, allowedKeys = []) {
  const existing = foundry.utils.getProperty(sheet.document, name);
  const copy = foundry.utils.deepClone(existing) || {};
  const updateData = {};

  Object.keys(copy).forEach((k) => {
    if (!allowedKeys.includes(k)) {
      updateData[`${name}.-=${k}`] = null;
    }
  });

  await sheet.document.update(updateData);
}
