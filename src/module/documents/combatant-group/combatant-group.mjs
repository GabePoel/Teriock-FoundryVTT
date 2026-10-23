import { EmbeddableDataMixin, PanelDataMixin } from "../../data/mixins/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { CombatantGroup } = foundry.documents;

/**
 * The Teriock CombatantGroup implementation.
 * @extends {CombatantGroup}
 * @mixes BaseDocument
 * @mixes PanelData
 */
export default class TeriockCombatantGroup
  extends mixClasses(CombatantGroup, BaseDocumentMixin, EmbeddableDataMixin, PanelDataMixin)
{}
