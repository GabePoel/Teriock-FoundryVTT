/**
 * Sets up all event listeners for the sheet.
 * Configures handlers for form updates, record fields, set fields, array fields, and changes.
 * @param {DocumentSheetV2} sheet
 */
export default async function _setupEventListeners(sheet) {
  setupUpdateHandlers(sheet);
  setupRecordFieldHandlers(sheet);
  setupSetFieldHandlers(sheet);
  setupArrayFieldHandlers(sheet);
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
 * Sets up handlers for set field components.
 * Configures multi-select inputs and remove buttons for set fields.
 * @param {DocumentSheetV2} sheet
 */
function setupSetFieldHandlers(sheet) {
  sheet.element.querySelectorAll(".teriock-update-set").forEach((container) => {
    const select = container.querySelector("select");
    if (!select) {
      return;
    }

    const name = container.getAttribute("name");
    const getValues = () =>
      Array.from(select.parentElement.querySelectorAll(".tag")).map(
        (tag) => tag.dataset.key,
      );

    select.addEventListener("input", async () => {
      const values = getValues();
      const selectedValue = select.value;
      if (selectedValue && !values.includes(selectedValue)) {
        values.push(selectedValue);
      }
      await updateSetField(sheet, name, values);
    });

    container.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = /** @type {HTMLElement} */ e.currentTarget;
        const closest = /** @type {HTMLElement} */ target.closest(".tag");
        const key = closest.dataset.key;
        const values = getValues().filter((k) => k !== key);
        await updateSetField(sheet, name, values);
      });
    });
  });
}

/**
 * Sets up handlers for array field components.
 * Configures add buttons for array fields.
 * @param {DocumentSheetV2} sheet
 */
function setupArrayFieldHandlers(sheet) {
  sheet.element.querySelectorAll(".teriock-array-field-add").forEach(
    /** @param {HTMLButtonElement} button */ (button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        await addToArrayField(
          sheet,
          button.getAttribute("name"),
          button.dataset.path,
        );
      });
    },
  );
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

/**
 * Adds an item to an array field.
 * @param {DocumentSheetV2} sheet
 * @param {string} name - The field name.
 * @param {string} fieldPath - The path to the field schema.
 * @returns {Promise<void>} Promise that resolves when the item is added.
 */
async function addToArrayField(sheet, name, fieldPath) {
  const cleanFieldPath = fieldPath.startsWith("system.")
    ? fieldPath.slice(7)
    : fieldPath;
  const copy =
    foundry.utils.deepClone(foundry.utils.getProperty(sheet.document, name)) ||
    [];
  const field = sheet.document.system.schema.getField(cleanFieldPath).element;
  const initial = field.getInitialValue();

  copy.push(initial);
  await sheet.document.update({ [name]: copy });
}

/**
 * Updates a set field with new values.
 * @param {DocumentSheetV2} sheet
 * @param {string} name - The field name.
 * @param {Array} values - Array of values for the set.
 * @returns {Promise<void>} Promise that resolves when the set is updated.
 */
async function updateSetField(sheet, name, values = []) {
  await sheet.document.update({ [name]: new Set(values) });
}
