const { DialogV2 } = foundry.applications.api;

/**
 * Select some number of documents.
 *
 * @template T
 * @param {T[]} documents
 * @param {object} [options]
 * @param {string} [options.title="Select Documents"]
 * @param {string} [options.hint=""]
 * @param {boolean} [options.multi=true]
 * @param {boolean} [options.tooltip=true]
 * @param {string} [options.idKey="uuid"]
 * @param {string} [options.nameKey="name"]
 * @param {string} [options.imgKey="img"]
 * @returns {Promise<T[]>} Selected documents.
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
    };
  }

  if (options.tooltip) {
    await Promise.all(
      documents.map(async (doc) => {
        const id = foundry.utils.getProperty(doc, options.idKey);
        context.documents[id].tooltip = await doc.buildMessage?.();
      }),
    );
  }

  const tmpl = options.multi
    ? "systems/teriock/src/templates/dialog-templates/document-select-multi.hbs"
    : "systems/teriock/src/templates/dialog-templates/document-select-one.hbs";

  const content = await foundry.applications.handlebars.renderTemplate(
    tmpl,
    context,
  );

  const selectedIds = await DialogV2.prompt({
    window: { title: options.title },
    content,
    ok: {
      callback: (_event, button) => {
        if (options.multi) {
          return Array.from(button.form.elements)
            .filter((e) => e?.checked)
            .map((e) => e?.name);
        }
        return [button.form.elements.namedItem("choice").value];
      },
    },
  });
  return selectedIds.map((id) => idToDoc.get(id)).filter(Boolean);
}

/**
 * Select exactly one document.
 *
 * @template T
 * @param {T[]} documents
 * @param {object} [options]
 * @param {string} [options.title="Select Document"]
 * @param {string} [options.hint=""]
 * @param {boolean} [options.tooltip=true]
 * @param {string} [options.idKey="uuid"]
 * @param {string} [options.nameKey="name"]
 * @param {string} [options.imgKey="img"]
 * @returns {Promise<T|null>} Selected document, or null if canceled.
 */
export async function selectDocumentDialog(documents, options = {}) {
  options = foundry.utils.mergeObject(
    {
      title: "Select Document",
      hint: "",
      tooltip: true,
      idKey: "uuid",
      imgKey: "img",
      nameKey: "name",
    },
    options,
  );
  const selected = await selectDocumentsDialog(documents, {
    ...options,
    multi: false,
  });
  return selected?.[0] ?? null;
}
