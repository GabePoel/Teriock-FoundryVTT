const { DialogV2 } = foundry.applications.api;

/**
 * Select some number of documents.
 *
 * @template T
 * @param {T[]} documents - Documents to display. Each must have name, image, and uuid.
 * @param {object} options
 * @param {string} options.[title] - Title for the dialog.
 * @param {string} options.[hint] - Text for the dialog.
 * @param {boolean} options.[multi] - Select multiple documents? Defaults to true.
 * @param {boolean} options.[tooltip] - Display tooltip for documents?
 * @returns {Promise<Teriock.UUID<T>[]>} Array of selected documents. Only includes one if not multi.
 */
export default async function selectDocumentDialog(
  documents,
  options = {
    title: "Select Documents",
    hint: "",
    multi: true,
    tooltip: true,
  },
) {
  const context = {
    documents: {},
    hint: options.hint,
    tooltip: options.tooltip,
  };
  for (const doc of documents) {
    context.documents[doc.uuid] = {
      name: doc.name,
      img: doc.img,
    };
  }
  if (options.tooltip) {
    for (const doc of documents) {
      context.documents[doc.uuid].tooltip = await doc.buildMessage();
    }
  }
  let content;
  if (options.multi) {
    content = await foundry.applications.handlebars.renderTemplate(
      "systems/teriock/src/templates/dialog-templates/document-select-multi.hbs",
      context,
    );
    return await DialogV2.prompt({
      window: { title: options.title },
      content: content,
      ok: {
        callback: (_event, button) =>
          Array.from(button.form.elements)
            .filter((e) => e?.checked)
            .map((e) => e?.name),
      },
    });
  } else {
    content = await foundry.applications.handlebars.renderTemplate(
      "systems/teriock/src/templates/dialog-templates/document-select-one.hbs",
      context,
    );
    return await DialogV2.prompt({
      window: { title: options.title },
      content: content,
      ok: {
        callback: (_event, button) => [
          button.form.elements.namedItem("choice").value,
        ],
      },
    });
  }
}
