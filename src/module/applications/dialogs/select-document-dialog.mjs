import { TeriockDocumentSelector } from "../api/_module.mjs";

/**
 * Select any number of documents.
 * @template T
 * @param {T[]} documents
 * @param {Teriock.SelectOptions.DocumentsSelect} [options]
 * @returns {Promise<T[]>}
 */
export async function selectDocumentsDialog(documents, options = {}) {
  options = foundry.utils.mergeObject(
    {
      title: "Select Documents",
      hint: "",
      multi: true,
      tooltip: true,
      idKey: "uuid",
      imgKey: "img",
      nameKey: "name",
      tooltipKey: null,
    },
    options,
  );

  const idToDoc = new Map();
  const context = {
    documents: {},
    hint: options.hint,
    tooltip: options.tooltip,
  };

  for (const doc of documents) {
    const id = foundry.utils.getProperty(doc, options.idKey);
    idToDoc.set(id, doc);
    context.documents[id] = {
      name: foundry.utils.getProperty(doc, options.nameKey),
      img: foundry.utils.getProperty(doc, options.imgKey),
      rescale: doc.rescale || false,
    };
    if (options.tooltipKey && options.tooltip) {
      context.documents[id].tooltip = foundry.utils.getProperty(
        doc,
        options.tooltipKey,
      );
    }
  }

  if (options.tooltip && !options.tooltipKey) {
    await Promise.all(
      documents.map(async (doc) => {
        const id = foundry.utils.getProperty(doc, options.idKey);
        context.documents[id].tooltip = await doc.toTooltip?.();
      }),
    );
  }

  const sheet = new TeriockDocumentSelector(context.documents, {
    multi: options.multi,
    hint: options.hint,
    tooltip: options.tooltip,
    title: options.title,
  });

  const selected = await sheet.select();
  if (selected) {
    return selected.map((id) => idToDoc.get(id)).filter(Boolean);
  } else {
    return [];
  }
}

/**
 * Select one document.
 * @template T
 * @param {T[]} documents
 * @param {Teriock.SelectOptions.DocumentSelect} [options]
 * @returns {Promise<T|null>}
 */
export async function selectDocumentDialog(documents, options = {}) {
  const selected = await selectDocumentsDialog(documents, {
    ...options,
    multi: false,
  });
  return selected?.[0] ?? null;
}
