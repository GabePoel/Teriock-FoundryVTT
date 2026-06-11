import { TeriockTextEditor } from "../_module.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const codeEnricher = {
  format: { aliases: ["code"], hasConfig: false, hasMultipleArguments: false, type: "display" },
  id: "inlineCode",
  onRender: el => {
    el.addEventListener("click", async (ev) => {
      ev.stopImmediatePropagation();
      await game.clipboard.copyPlainText(el.textContent);
      ui.notifications.info("TERIOCK.SHEETS.Common.NOTIFICATIONS.copiedToClipboard", {
        format: { text: el.textContent },
      });
    });
  },
  process: async (inputs) => {
    return TeriockTextEditor.createAnchor({
      classes: ["teriock-inline-code"],
      dataset: { tooltip: "TERIOCK.SHEETS.Common.ENRICHMENT.copyCode" },
      name: inputs.arguments[0],
    });
  },
};

export default codeEnricher;
