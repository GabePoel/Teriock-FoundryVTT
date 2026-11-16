import { TeriockTextEditor } from "../_module.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const codeEnricher = {
  format: { aliases: ["code"], hasConfig: false, hasMultipleArguments: false, type: "display" },
  id: "inlineCode",
  onRender: el => {
    el.addEventListener("click", async (ev) => {
      ev.stopImmediatePropagation();
      const text = el.textContent.replace(/\p{Cf}/gu, "").trim();
      await game.clipboard.copyPlainText(text);
      ui.notifications.info("TERIOCK.SHEETS.Common.NOTIFICATIONS.copiedToClipboard", {
        format: { text },
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
