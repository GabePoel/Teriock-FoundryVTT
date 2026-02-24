import { getImage } from "../../../../helpers/path.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { BaseSystem } from "../../abstract/_module.mjs";
import { AutomatableSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseSystem}
 * @implements {Teriock.Models.HarmSystemInterface}
 * @mixes AutomatableSystem
 */
export default class HarmSystem extends mix(
  BaseSystem,
  AutomatableSystemMixin,
) {
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.ChatMacroAutomation,
      automations.ChatStatusAutomation,
      automations.HacksAutomation,
      automations.RollAutomation,
      automations.TakeAutomaton,
    ];
  }

  static get metadata() {
    return {
      pseudos: {
        Automation: "system.automations",
      },
    };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({
        categories: ["IMAGE"],
      }),
    });
  }

  get document() {
    return this.parent;
  }

  get metadata() {
    return this.constructor.metadata;
  }

  /** @inheritDoc */
  get nameString() {
    return game.i18n.format("TERIOCK.SYSTEMS.Harm.EMBED.nameString", {
      name: super.nameString,
      type: TERIOCK.options.document[this.parent.type]?.name || "",
    });
  }

  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (!data.text?.content) {
      this.parent.updateSource({
        "text.content": game.i18n.localize(
          "TERIOCK.SYSTEMS.Harm.DATA.description",
        ),
      });
    }
    if (!data.system?.img) {
      let ref = "";
      if (this.parent.type === "damage") ref = "Damaging";
      if (this.parent.type === "drain") ref = "Draining";
      this.parent.updateSource({ "system.img": getImage("effect-types", ref) });
    }
  }
}
