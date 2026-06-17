import { TeriockDocumentSelector } from "../api/_module.mjs";

/**
 * Select any number of documents.
 * @template T
 * @param {T[]} documents
 * @param {Teriock.Select.SelectDocumentsDialogOptions} [options]
 * @returns {Promise<T[]>}
 */
export async function selectDocumentsDialog(documents, options = {}) {
  options = {
    checked: [],
    hint: "",
    idKey: "uuid",
    imgKey: "img",
    localize: true,
    multi: true,
    nameKey: "name",
    noDocumentsMessage: _loc("TERIOCK.DIALOGS.SelectDocument.noOptions"),
    openable: false,
    silent: false,
    textKey: null,
    title: _loc("TERIOCK.DIALOGS.SelectDocument.defaults.title"),
    tooltip: true,
    tooltipIdentifier: null,
    tooltipKey: null,
    tooltipUuid: "uuid",
    ...options,
  };

  if (options.localize) {
    options.noDocumentsMessage = _loc(options.noDocumentsMessage);
    options.title = _loc(options.title);
    options.hint = _loc(options.hint);
  }

  if (documents.length === 0 && !options.silent) {
    ui.notifications.warn(options.noDocumentsMessage);
    return [];
  }

  const idToDoc = new Map();
  /**
   * @type {Teriock.Select.DocumentSelectContext}
   */
  const context = { documents: {}, hint: options.hint, tooltip: options.tooltip };

  documents.sort((a, b) =>
    foundry.utils.getProperty(a, options.nameKey).localeCompare(foundry.utils.getProperty(b, options.nameKey))
  );

  if (!options.multi && options.checked && options.checked.length > 0) { options.checked.length = 1; }

  for (const doc of documents) {
    const id = foundry.utils.getProperty(doc, options.idKey);
    idToDoc.set(id, doc);
    context.documents[id] = {
      checked: options.checked.includes(id),
      img: foundry.utils.getProperty(doc, options.imgKey),
      name: foundry.utils.getProperty(doc, options.nameKey),
      text: "",
      tooltipHtml: options.tooltipKey ? foundry.utils.getProperty(doc, options.tooltipKey) : undefined,
      tooltipIdentifier: options.tooltipIdentifier
        ? foundry.utils.getProperty(doc, options.tooltipIdentifier)
        : undefined,
      tooltipUuid: options.tooltipUuid ? foundry.utils.getProperty(doc, options.tooltipUuid) : undefined,
      uuid: doc.uuid,
    };
    if (options.textKey) { context.documents[id].text = foundry.utils.getProperty(doc, options.textKey) || ""; }
    if (options.tooltipKey && options.tooltip && !options.tooltipAsync) {
      context.documents[id].tooltip = foundry.utils.getProperty(doc, options.tooltipKey);
    }
  }

  const selected = await TeriockDocumentSelector.prompt(context.documents, {
    hint: options.hint,
    icon: options.icon,
    multi: options.multi,
    openable: options.openable,
    title: options.title,
    tooltip: options.tooltip,
  });
  if (selected) { return selected.map(id => idToDoc.get(id)).filter(Boolean); }
  return [];
}

/**
 * Select one document.
 * @template T
 * @param {T[]} documents
 * @param {Teriock.Select.SelectDocumentDialogOptions} [options]
 * @returns {Promise<T|null>}
 */
export async function selectDocumentDialog(documents, options = {}) {
  if ((options.auto ?? true) && documents.length === 1) { return documents[0]; }
  if (options.silent && !documents.length) { return null; }
  const selected = await selectDocumentsDialog(documents, {
    ...options,
    checked: options.checked ? [options.checked] : [],
    multi: false,
  });
  return selected?.[0] ?? null;
}
