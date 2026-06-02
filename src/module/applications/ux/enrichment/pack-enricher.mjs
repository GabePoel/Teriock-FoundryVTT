import { createElement } from "../../../helpers/html.mjs";
import { makeIconElement } from "../../../helpers/utils.mjs";

/** @type {Teriock.Enrichment.EnricherConfig} */
const packEnricher = {
  format: { aliases: ["Pack"], hasConfig: false, hasMultipleArguments: false, type: "link" },
  id: "openPack",
  onRender: el => {
    if (el.dataset.enriched) { return; }
    el.dataset.enriched = "true";
    /** @type {HTMLElement} */
    const target = el.firstElementChild;
    el.addEventListener("click", () => game.packs.get(target.dataset.pack)?.render(true));
  },
  process: (parsed) => {
    const pack = game.packs.get(parsed.arguments[0]);
    const anchor = createElement("a", {
      className: "teriock-inline-command",
      dataset: {
        action: "openPack",
        pack: parsed.arguments[0],
        tooltip: _loc("TERIOCK.COMMANDS.OpenPack", { title: pack?.title }),
      },
    });
    anchor.prepend(makeIconElement(TERIOCK.display.icons.ui.compendium, "inline"));
    anchor.appendChild(document.createTextNode(_loc(parsed.label ?? pack?.title)));
    return anchor;
  },
};

export default packEnricher;
