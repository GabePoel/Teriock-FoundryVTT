import { TeriockTextEditor } from "../_module.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";

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
    return TeriockTextEditor.createAnchor({
      classes: ["teriock-inline-command"],
      dataset: {
        action: "openPack",
        pack: parsed.arguments[0],
        tooltip: _loc("TERIOCK.COMMANDS.OpenPack", { title: pack?.title }),
      },
      icon: makeIconClass(TERIOCK.display.icons.ui.compendium, "inline"),
      name: _loc(parsed.label ?? pack?.title),
    });
  },
};

export default packEnricher;
