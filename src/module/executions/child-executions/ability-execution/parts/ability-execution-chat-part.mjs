import statConfig from "../../../../constants/config/stat-config.mjs";
import { ConstructionNode } from "../../../../data/pseudo-documents/_module.mjs";
import * as affinityTypes from "../../../../data/pseudo-documents/affinities/_module.mjs";
import { BaseAffinity } from "../../../../data/pseudo-documents/affinities/abstract/_module.mjs";
import * as expirationTypes from "../../../../data/pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityExecutionChat>}
 */
export default function AbilityExecutionChatPart(Base) {
  /**
   * @mixin
   */
  class AbilityExecutionChat extends Base {
    /** @type {Record<"normal"|"crit", Teriock.Panels.PanelAssociation[]>} */
    #associationMap;

    /** @type {Record<"normal"|"crit", Teriock.Changes.QualifiedChangeData[]>} */
    #trackerMap;

    /**
     * @param {Teriock.Panels.PanelAssociation} association
     * @param {string} key
     */
    #addAssociationToMap(association, key) {
      const associations = this.#associationMap[key];
      const existing = associations.find(a => a.title === association.title);
      if (!existing) { associations.push(association); }
      else {
        const existingUuids = new Set(existing.cards.map(e => e.uuid));
        existing.cards.push(...association.cards.filter(c => !existingUuids.has(c.documentUuid)));
      }
    }

    /**
     * @param {Teriock.Changes.QualifiedChangeData[]} trackers
     * @param {string} key
     * @todo This craves death.
     */
    #addTrackersToMap(trackers, key) {
      const existingValues = new Set(this.#trackerMap[key].map(e => e?.value));
      this.#trackerMap[key].push(...trackers.filter(t => !existingValues.has(t?.value)));
    }

    /**
     * @param {StatusAutomation} automation
     * @param {UUID<TeriockTokenDocument|TeriockActor>[]} uuids
     * @todo This will get got like `#generateConditionTracker`.
     */
    #attachTrackedStatusAutomationUuids(automation, uuids) {
      /** @type {Teriock.Panels.PanelAssociation} */
      const association = {
        cards: uuids.map(uuid => this.#generateAssociationCard(uuid)),
        icon: TERIOCK.config.document.creature.icon,
        title: _loc("TERIOCK.SYSTEMS.Ability.PANELS.statusWithRespectTo", {
          status: TERIOCK.reference.conditions[automation.status],
        }),
      };
      const trackers = uuids.map(uuid => this.#generateConditionTracker(automation.status, uuid));
      if (automation.crit.has(0)) {
        this.#addAssociationToMap(association, "normal");
        this.#addTrackersToMap(trackers, "normal");
      }
      if (automation.crit.has(1)) {
        this.#addAssociationToMap(association, "crit");
        this.#addTrackersToMap(trackers, "crit");
      }
    }

    /**
     * Generate an association card.
     * @param {UUID<TeriockTokenDocument|TeriockActor>} uuid
     * @returns {Teriock.Panels.PanelAssociationCard}
     */
    #generateAssociationCard(uuid) {
      const doc = fromUuidSync(uuid);
      return { id: /** @type {ID<TeriockDocument>} */ doc.id, img: doc.img, name: doc.name, uuid };
    }

    /**
     * Generate a condition tracker.
     * @param {Teriock.Keys.Condition} status
     * @param {UUID<TeriockTokenDocument|TeriockActor>} uuid
     * @returns {Teriock.Changes.QualifiedChangeData}
     * @todo Completely redo this as part of the new condition handling once the shared condition registry is made.
     */
    #generateConditionTracker(status, uuid) {
      return {
        key: `system.conditionInformation.${status}.trackers`,
        phase: "initial",
        priority: 10,
        type: "add",
        value: uuid,
      };
    }

    /**
     * Generate associations for both crit and normal consequences.
     * @returns {Promise<void>}
     */
    async #generateConsequenceAssociations() {
      this.#associationMap = { crit: [], normal: [] };
      this.#trackerMap = { crit: [], normal: [] };
      const statusAutomations = this.automations.getTypeSync("status", { active: true });
      const targetAutomations = statusAutomations.filter(a => a.target);
      for (const a of targetAutomations) {
        const uuids = (await a.selectVisibleTokens()).map(t => t.uuid);
        this.#attachTrackedStatusAutomationUuids(a, uuids);
      }
      const executorAutomations = statusAutomations.filter(a => a.executor);
      for (const a of executorAutomations) {
        const uuid = this.actor?.defaultToken?.document?.uuid || this.actor?.uuid;
        if (uuid) { this.#attachTrackedStatusAutomationUuids(a, [uuid]); }
      }
    }

    /**
     * @param {boolean} crit
     * @returns {Teriock.Keys.Status[]}
     */
    #generateConsequenceStatuses(crit = false) {
      const statusAutomations = this.automations.getTypeSync("status", { active: true, crit });
      return statusAutomations.filter(a => a.relation === "include").map(a => a.status);
    }

    /**
     * @param {boolean} crit
     * @returns {Promise<Partial<Teriock.Transformation.EffectTransformationConfig>>}
     */
    async #generateConsequenceTransformation(crit = false) {
      const transformationAutomations = this.automations.getTypeSync("transformation", { active: true, crit });
      const transformation = { enabled: Boolean(transformationAutomations.length), uuids: [] };
      if (transformation.enabled) {
        const a = transformationAutomations[0];
        Object.assign(transformation, {
          competence: { raw: a.getCompetence({ execution: this }) },
          img: a.img,
          level: a.level,
          override: Array.from(a.override),
          resets: Array.from(a.resets),
          ring: a.ring,
          suppress: Array.from(a.suppress),
        });
      }
      return transformation;
    }

    /**
     * @param {boolean} crit
     * @returns {Record<string, object>}
     */
    #generateEffectAffinities(crit = false) {
      const types = Object.values(affinityTypes).filter(a => foundry.utils.isSubclass(a, BaseAffinity));
      const out = {};
      for (const Cls of types) {
        const affinities = this.affinities.getTypeSync(Cls.metadata.type, { active: true, crit });
        for (const a of affinities) {
          const data = a.toObject();
          data._id = foundry.utils.randomID();
          out[data._id] = data;
        }
      }
      return out;
    }

    /**
     * @param {boolean} crit
     * @returns {Record<string, object>}
     */
    #generateEffectAutomations(crit = false) {
      const types = CONFIG.ActiveEffect.dataModels.consequence._automationTypes;
      const out = {};
      for (const Cls of types) {
        const automations = this.automations.getTypeSync(Cls.metadata.type, { active: true, crit });
        for (const a of automations) {
          const data = a.toObject();
          data._id = foundry.utils.randomID();
          if (data?.type === "changes") {
            data?.changes.forEach(c => {
              c.value = this._heightenString(c.value);
            });
          }
          if (data?.type === "childChange") { data.value = this._heightenString(data.value); }
          out[data._id] = data;
        }
      }
      return out;
    }

    /**
     * Generate the JSON serializable data for a consequence.
     * @param {boolean} crit
     * @returns {Promise<object>}
     */
    async #generateEffectConsequence(crit = false) {
      return foundry.utils.mergeObject(await this.#generateEffectImbuement(crit), {
        showIcon: 1,
        statuses: this.#generateConsequenceStatuses(crit),
        system: { associations: [], transformation: await this.#generateConsequenceTransformation(crit) },
        type: "consequence",
      });
    }

    /**
     * @param {boolean} crit
     * @returns {Promise<number>}
     */
    async #generateEffectDuration(crit = false) {
      const durationAutomations = this.automations.getTypeSync("duration", { active: true, crit });
      let durationFormula = this.source.system.duration.formula;
      durationAutomations.forEach(a => {
        durationFormula = BaseRoll.replaceFormulaData(a.substitution, {
          base: durationFormula,
          new: a.duration.formula,
        });
      });
      let durationValue = await BaseRoll.getValue(durationFormula, this.getRollData());
      if (durationValue >= TERIOCK.config.system.inf / 10) { durationValue = undefined; }
      return durationValue;
    }

    /**
     * @param {boolean} crit
     * @returns {Record<string, object>}
     */
    #generateEffectExpirations(crit = false) {
      const types = Object.values(expirationTypes).filter(e => foundry.utils.isSubclass(e, BaseExpiration));
      const out = {};
      for (const Cls of types) {
        const expirations = this.expirations.getTypeSync(Cls.metadata.type, { active: true, crit });
        for (const e of expirations) {
          const data = e.toObject();
          data._id = foundry.utils.randomID();
          out[data._id] = data;
        }
      }
      return out;
    }

    /**
     * Generate the JSON serializable data for an imbuement.
     * @param {boolean} crit
     * @returns {Promise<object>}
     */
    async #generateEffectImbuement(crit = false) {
      return {
        changes: [],
        duration: { expiry: null, seconds: await this.#generateEffectDuration(crit) },
        img: this.source.img,
        name: _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", { name: this.source.name }),
        origin: this.source.uuid,
        showIcon: 0,
        system: {
          _src: this.source.uuid,
          affinities: this.#generateEffectAffinities(crit),
          applyIfDeattuned: true,
          automations: this.#generateEffectAutomations(crit),
          blocks: (await this.source.system.getPanelParts()).blocks,
          competence: { raw: this.competence.value },
          critical: crit,
          effectTypes: Array.from(this.source.system.effectTypes),
          elements: Array.from(this.source.system.elements),
          executor: this.actor?.uuid ?? null,
          expirations: this.#generateEffectExpirations(crit),
          heightened: this.heightened,
          identifier: `${this.source.forcedIdentifier}-effect`,
          powerSources: Array.from(this.source.system.powerSources),
          sustained: this.source.system.sustained,
        },
        type: "imbuement",
      };
    }

    /** @inheritDoc */
    async _buildActivations() {
      const acts = teriock.data.pseudoDocuments.activations;
      const overrideAutomation = this.automations.getTypeSync("override", { active: true })[0];

      // Add feat save activation
      if (this.isFeat && !overrideAutomation?.preventFeat) {
        const featOptions = { attribute: this.source.system.featSaveAttribute };
        if (!overrideAutomation?.preventThreshold) { featOptions.threshold = this.rolls[0].total; }
        this.activations.push(new acts.FeatActivation({ options: featOptions }));
      }

      // Add block cone activation
      if (this.source.system.delivery === "cone" && !overrideAutomation?.preventBlockCone) {
        this.activations.push(new acts.UseLocalActivation({ options: { lookup: "ability:block-cone" } }));
      }

      // Add custom effect activations
      // TODO: All of this can be done better by delegating effect data manipulation to the automations... Someday...
      const makeEffect = overrideAutomation?.makeEffect ?? null;
      const makeCritEffect = overrideAutomation?.makeCritEffect ?? null;
      const targetsActor = overrideAutomation?.targetsActor ?? this.targetsActor;
      const targetsArmament = overrideAutomation?.targetsArmament ?? this.targetsArmament;
      const shouldMakeCrit = makeCritEffect === true || (makeCritEffect !== false && this.shouldMakeCritEffect);
      if (
        makeEffect !== false
        && (makeEffect === true
          || (this.source.system.duration.unit !== "instant" && this.source.system.maneuver !== "passive"))
        && (targetsActor || targetsArmament)
      ) {
        const variants = [];
        for (const crit of shouldMakeCrit ? [false, true] : [false]) {
          const conData = await this.#generateEffectConsequence(crit);
          conData.children = this.source.subs.map(s => s.toObject());
          const imbData = await this.#generateEffectImbuement(crit);
          imbData.children = [];
          variants.push({ con: { data: conData, nodes: [] }, crit, imb: { data: imbData, nodes: [] } });
        }
        await this.#generateConsequenceAssociations();
        for (const v of variants) {
          const key = v.crit ? "crit" : "normal";
          v.con.data.system.associations = this.#associationMap[key];
          v.con.data.changes.push(...this.#trackerMap[key]);
        }
        const addAutomations = this.automations.getTypeSync("addDocuments", { active: true }).filter(a =>
          a.attachToEffect
        );
        for (const a of addAutomations) {
          const roots = await a.getNodes({ actor: this.actor, execution: this });
          const rootIds = new Set(roots.map(n => n._id));
          let nodes = roots.flatMap(n => [n, ...n.allChildNodes.contents]);
          if (a.selectInExecution) {
            nodes = await Promise.all(nodes.map(n => n.getDeterministicCopy({ actor: this.actor, execution: this })));
          }
          for (const [i, v] of variants.entries()) {
            if (!a.crit.has(i)) { continue; }
            v.con.nodes.push({ nodes, rootIds });
            v.imb.nodes.push({ nodes, rootIds });
          }
        }
        const transformationAutomations = this.automations.getTypeSync("transformation", { active: true });
        for (const a of transformationAutomations) {
          const toAdd = (await a.selectDocuments({ relativeTo: this.actor })).map(d => d.uuid);
          for (const [i, v] of variants.entries()) {
            if (a?.crit.has(i)) { v.con.data.system.transformation.uuids.push(...toAdd); }
          }
        }
        for (const v of variants) {
          this.automations.getTypeSync("override", { active: true, crit: v.crit }).forEach(a => {
            for (const effectData of [v.con.data, v.imb.data]) {
              const competence = a?.getCompetence({ execution: this });
              if (typeof competence === "number") {
                foundry.utils.setProperty(effectData, "system.competence.raw", competence);
              }
              if (a?.overrideData && a.data) { foundry.utils.mergeObject(effectData, a.data, { inplace: true }); }
            }
          });
        }
        const makeRootNode = (data, name) => ({
          _id: foundry.utils.randomID(),
          competence: { raw: foundry.utils.getProperty(data, "system.competence.raw") ?? 0 },
          data: JSON.stringify(data),
          name,
          overrideData: true,
          parentId: null,
          setCompetence: "override",
          type: "base",
        });
        const critName = crit => _loc(`TERIOCK.AUTOMATIONS.Crit.FIELDS.crit.choices.${crit ? 1 : 0}`);
        const addActivation = (target, kind, labelKey) => {
          const effectNodes = [];
          for (const v of variants) {
            // TODO: Improve names for these
            const rootNode = makeRootNode(v[kind].data, critName(v.crit));
            effectNodes.push(rootNode);
            for (const { nodes, rootIds } of v[kind].nodes) {
              for (const node of nodes) {
                const obj = node.toObject();
                if (rootIds.has(obj._id)) { obj.parentId = rootNode._id; }
                effectNodes.push(obj);
              }
            }
          }
          // TODO: Improve labels for these
          this.activations.push(
            new acts.AddDocumentsActivation({
              all: false,
              auto: true,
              constructionNodes: ConstructionNode.toCollectionObject(effectNodes, { keepId: true }),
              display: { label: overrideAutomation?.display?.label || `TERIOCK.COMMANDS.ApplyEffect.${labelKey}` },
              multi: false,
              target,
            }),
          );
        };
        if (targetsActor) { addActivation("actor", "con", "label"); }
        if (targetsArmament) { addActivation("armament", "imb", "armament"); }
      }

      // Add all pre-defined activations
      await super._buildActivations();
    }

    /** @inheritDoc */
    async _buildSourcePanel() {
      const panel = await super._buildSourcePanel();
      if (!panel) { return panel; }
      const blockStates = {
        "TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label": this.heightened,
        "TERIOCK.SYSTEMS.Ability.FIELDS.overview.fluent.label": this.competence.fluent,
        "TERIOCK.SYSTEMS.Ability.FIELDS.overview.proficient.label": this.competence.proficient,
      };
      for (const [labelKey, active] of Object.entries(blockStates)) {
        const block = panel.blocks.find(b => b.title === _loc(labelKey));
        if (!block) { continue; }
        if (active) { delete block.classes; }
        else { block.classes = [TERIOCK.display.panels.styles.faded]; }
      }
      return panel;
    }

    /** @inheritDoc */
    async _buildTags() {
      await super._buildTags();
      if (this.heightened > 0) {
        if (this.heightened === 1) { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")); }
        else { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", { value: this.heightened })); }
      }
      for (const c of Object.keys(this.costs).filter(c => this.costs[c] > 0)) {
        this.tags.push(
          _loc("TERIOCK.SYSTEMS.Applicable.PANELS.spent", {
            amount: this.costs[c],
            label: statConfig[c]?.abbreviation,
          }),
        );
      }
      this._buildBoostTags();
    }
  }

  return AbilityExecutionChat;
}
