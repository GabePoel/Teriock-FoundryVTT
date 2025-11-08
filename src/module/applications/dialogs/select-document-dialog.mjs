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
      hint: "",
      idKey: "uuid",
      imgKey: "img",
      multi: true,
      nameKey: "name",
      openable: false,
      textKey: null,
      title: "Select Documents",
      tooltip: true,
      tooltipAsync: false,
      tooltipKey: null,
      tooltipUUID: "uuid",
    },
    options,
  );

  const idToDoc = new Map();
  /**
   * @type {Teriock.SelectOptions.DocumentSelectContext}
   */
  const context = {
    documents: {},
    hint: options.hint,
    tooltip: options.tooltip,
  };

  documents.sort((a, b) =>
    foundry.utils
      .getProperty(a, options.nameKey)
      .localeCompare(foundry.utils.getProperty(b, options.nameKey)),
  );

  for (const doc of documents) {
    const id = foundry.utils.getProperty(doc, options.idKey);
    idToDoc.set(id, doc);
    context.documents[id] = {
      img: foundry.utils.getProperty(doc, options.imgKey),
      name: foundry.utils.getProperty(doc, options.nameKey),
      rescale: doc.rescale || false,
      text: "",
      tooltip: options.tooltipAsync ? TERIOCK.display.panel.loading : undefined,
      uuid:
        options.tooltipAsync || options.openable
          ? foundry.utils.getProperty(doc, options.tooltipUUID)
          : undefined,
    };
    if (options.textKey) {
      context.documents[id].text =
        foundry.utils.getProperty(doc, options.textKey) || "";
    }
    if (options.tooltipKey && options.tooltip && !options.tooltipAsync) {
      context.documents[id].tooltip = foundry.utils.getProperty(
        doc,
        options.tooltipKey,
      );
    }
  }

  if (options.tooltip && !options.tooltipKey && !options.tooltipAsync) {
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
    tooltipAsync: options.tooltipAsync,
    openable: options.openable,
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
