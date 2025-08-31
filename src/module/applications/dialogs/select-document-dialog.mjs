import { SelectSheet } from "../sheets/misc-sheets/_module.mjs";

/**
 * @template T
 * @param {T[]} documents
 * @param {object} [options]
 * @param {string} [options.title="Select Documents"]
 * @param {string} [options.hint=""]
 * @param {boolean} [options.multi=true]
 * @param {boolean} [options.tooltip=true]
 * @returns {Promise<T[]>}
 */
export async function selectDocumentsDialog(documents, options = {}) {
  options = foundry.utils.mergeObject(
    { title: "Select Documents", hint: "", multi: true, tooltip: true },
    options,
  );

  const sheet = new SelectSheet(documents, {
    multi: options.multi,
    hint: options.hint,
    tooltip: options.tooltip,
    title: options.title,
  });

  const result = await sheet.select();
  return options.multi ? result : result ? [result] : [];
}

/**
 * @template T
 * @param {T[]} documents
 * @param {object} [options]
 * @returns {Promise<T|null>}
 */
export async function selectDocumentDialog(documents, options = {}) {
  const selected = await selectDocumentsDialog(documents, {
    ...options,
    multi: false,
  });
  return selected?.[0] ?? null;
}
