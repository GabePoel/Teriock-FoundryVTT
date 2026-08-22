import affinityConfig from "../../../../../../constants/config/affinity-config.mjs";
import documentConfig from "../../../../../../constants/config/document-config.mjs";
import { icons } from "../../../../../../constants/display/icons.mjs";
import * as previews from "../../../../../../data/models/preview-models/_module.mjs";

/**
 * @import { ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 */

/** @type {{ label: string, types: AffinityType[] }[]} */
const AFFINITY_GROUPS = Object.values(affinityConfig.groups);

/**
 * @typedef {object} PlayableSection
 * @property {string} id - Tab and preview ID
 * @property {string} icon - Tab icon class
 * @property {string} label - Localization key for the tab label
 * @property {Teriock.Documents.CommonType[]} [dragTypes] - Dragged document types that open this tab
 * @property {Teriock.Previews.PreviewConfig} [preview] - The preview shown on this tab
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PlayableActorSheetSectionsPart>}
 * @property {TeriockActor} document
 */
export default function PlayableActorSheetSectionsPart(Base) {
  /**
   * @mixin
   */
  class PlayableActorSheetSectionsPart extends Base {
    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupAbility() {
      return [{
        docs: this.document.previewed.getTypeSync("ability").filter(a => !a.system.isBasic),
        empty: _loc("TERIOCK.SHEETS.Actor.TABS.Abilities.nonBasic"),
      }, { docs: game.teriock.basicAbilities, empty: _loc("TERIOCK.SHEETS.Actor.TABS.Abilities.basic") }];
    }

    /**
     * A group for each kind of affinity.
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupAffinity() {
      const entries = this.document.system.affinityEntries;
      return AFFINITY_GROUPS.map(group => ({
        docs: entries.filter(affinity => group.types.includes(affinity.type)),
        empty: _loc(group.label).toLowerCase(),
        optional: true,
      }));
    }

    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupConsequence() {
      return [{
        docs: this.document.previewed.getTypeSync("consequence"),
        empty: TERIOCK.config.document.consequence.plural.toLowerCase(),
      }, {
        docs: this.document.previewed.getTypeSync("attunement"),
        empty: TERIOCK.config.document.attunement.plural.toLowerCase(),
      }, {
        docs: this.document.effects.filter(e => ["base", "condition", "cover", "hack"].includes(e.type) && !e.isStatus),
        empty: TERIOCK.config.document.effect.plural.toLowerCase(),
        optional: true,
      }, {
        docs: this.document.system.virtualConditions.contents,
        empty: TERIOCK.config.document.condition.plural.toLowerCase(),
      }];
    }

    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupEquipment() {
      return [{
        docs: this.document.previewed.getTypeSync("equipment").filter(e => !e?.sup || e.sup.type !== "equipment"),
        empty: TERIOCK.config.document.equipment.plural.toLowerCase(),
      }, {
        docs: this.document.previewed.getTypeSync("body"),
        empty: TERIOCK.config.document.body.plural.toLowerCase(),
      }, {
        docs: this.document.previewed.getTypeSync("mount"),
        empty: TERIOCK.config.document.mount.plural.toLowerCase(),
      }];
    }

    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupFluency() {
      return [{
        docs: this.document.previewed.getTypeSync("fluency"),
        empty: TERIOCK.config.document.fluency.plural.toLowerCase(),
      }];
    }

    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupPower() {
      return [{
        docs: this.document.previewed.getTypeSync("species"),
        empty: TERIOCK.config.document.species.plural.toLowerCase(),
      }, {
        docs: this.document.previewed.getTypeSync("power"),
        empty: TERIOCK.config.document.power.plural.toLowerCase(),
      }];
    }

    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupRank() {
      return [{
        docs: this.document.previewed.getTypeSync("rank"),
        empty: TERIOCK.config.document.rank.plural.toLowerCase(),
      }, {
        docs: this.document.previewed.getTypeSync("archetype"),
        empty: TERIOCK.config.document.archetype.plural.toLowerCase(),
        optional: true,
      }];
    }

    /**
     * @this {PlayableActorSheetSectionsPart}
     * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
     */
    static async #previewGroupResource() {
      const consumable = "TERIOCK.SHEETS.Actor.TABS.Resources.consumable";
      return [{
        docs: this.document.previewed.getTypeSync("resource"),
        empty: TERIOCK.config.document.resource.plural.toLowerCase(),
      }, {
        docs: this.document.previewed.getTypeSync("ability").filter(a => a.system.consumable),
        empty: _loc(consumable, { value: TERIOCK.config.document.ability.plural.toLowerCase() }),
      }, {
        docs: this.document.previewed.getTypeSync("property").filter(p => p.system.consumable),
        empty: _loc(consumable, { value: TERIOCK.config.document.property.plural.toLowerCase() }),
      }];
    }

    /**
     * Object that {@link TABS} and {@link PREVIEWS} are derived from.
     * @type {PlayableSection[]}
     */
    static SECTIONS = [{
      dragTypes: ["fluency"],
      icon: documentConfig.fluency.icon,
      id: "tradecrafts",
      label: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title",
      preview: {
        addButton: { type: "fluency" },
        groups: this.#previewGroupFluency,
        model: previews.FluencyPreviewModel,
      },
    }, {
      icon: documentConfig.ability.icon,
      id: "abilities",
      label: "TERIOCK.SHEETS.Actor.TABS.Abilities.title",
      preview: {
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupAbility,
        model: previews.AbilityPreviewModel,
      },
    }, {
      dragTypes: ["equipment", "body", "mount"],
      icon: documentConfig.inventory.icon,
      id: "inventory",
      label: "TERIOCK.SHEETS.Actor.TABS.Inventory.title",
      preview: {
        addButton: { type: "equipment", types: ["equipment", "body", "mount"] },
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupEquipment,
        model: previews.EquipmentPreviewModel,
      },
    }, {
      dragTypes: ["rank", "archetype"],
      icon: documentConfig.rank.icon,
      id: "classes",
      label: "TERIOCK.SHEETS.Actor.TABS.Classes.title",
      preview: { addButton: { type: "rank" }, groups: this.#previewGroupRank, model: previews.RankPreviewModel },
    }, {
      dragTypes: ["power", "species"],
      icon: documentConfig.power.icon,
      id: "powers",
      label: "TERIOCK.SHEETS.Actor.TABS.Powers.title",
      preview: {
        addButton: { type: "power", types: ["power", "species"] },
        groups: this.#previewGroupPower,
        model: previews.PowerPreviewModel,
      },
    }, {
      dragTypes: ["resource"],
      icon: documentConfig.resource.icon,
      id: "resources",
      label: "TERIOCK.SHEETS.Actor.TABS.Resources.title",
      preview: {
        addButton: { type: "resource" },
        groups: this.#previewGroupResource,
        model: previews.MetaphysicsPreviewModel,
      },
    }, {
      dragTypes: ["attunement", "condition", "consequence", "cover", "hack"],
      icon: documentConfig.condition.icon,
      id: "effects",
      label: "TERIOCK.SHEETS.Actor.TABS.Effects.title",
      preview: {
        addButton: { type: "consequence", types: ["consequence", "attunement"] },
        data: { display: { gapless: true, size: "small" } },
        groups: this.#previewGroupConsequence,
      },
    }, {
      icon: icons.pseudoDocument.affinity,
      id: "affinities",
      label: "TERIOCK.SHEETS.Actor.TABS.Affinities.title",
      preview: {
        data: { display: { gapless: false, size: "medium" } },
        groups: this.#previewGroupAffinity,
        model: previews.AffinityPreviewModel,
      },
    }, { icon: icons.ui.details, id: "details", label: "TERIOCK.SHEETS.Actor.TABS.Details.title" }];

    /** @type {Record<string, Teriock.Previews.PreviewConfig>} */
    static PREVIEWS = Object.fromEntries(
      this.SECTIONS.filter(section => section.preview).map(section => [section.id, section.preview]),
    );

    /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
    static TABS = {
      primary: { initial: "tradecrafts", tabs: this.SECTIONS.map(({ icon, id, label }) => ({ icon, id, label })) },
    };
  }

  return PlayableActorSheetSectionsPart;
}
