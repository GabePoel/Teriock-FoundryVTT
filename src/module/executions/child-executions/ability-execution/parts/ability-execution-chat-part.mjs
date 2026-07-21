import statConfig from "../../../../constants/config/stat-config.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionChatPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
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
          existing.cards.push(...association.cards.filter(c => !existingUuids.has(c.uuid)));
        }
      }

      /**
       * @param {Teriock.Changes.QualifiedChangeData[]} trackers
       * @param {string} key
       */
      #addTrackersToMap(trackers, key) {
        const existingValues = new Set(this.#trackerMap[key].map(e => e?.value));
        this.#trackerMap[key].push(...trackers.filter(t => !existingValues.has(t?.value)));
      }

      /**
       * @param {StatusAutomation} automation
       * @param {UUID<TeriockTokenDocument|TeriockActor>[]} uuids
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
        const statusAutomations = this.getAutomations("status", { active: true });
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
        const statusAutomations = this.getAutomations("status", { active: true, crit });
        return statusAutomations.filter(a => a.relation === "include").map(a => a.status);
      }

      /**
       * @param {boolean} crit
       * @returns {Promise<Partial<Teriock.Transformation.EffectTransformationConfig>>}
       */
      async #generateConsequenceTransformation(crit = false) {
        const transformationAutomations = this.getAutomations("transformation", { active: true, crit });
        const transformation = { enabled: Boolean(transformationAutomations.length), uuids: [] };
        if (transformation.enabled) {
          const a = transformationAutomations[0];
          Object.assign(transformation, {
            competence: { raw: a.getCompetence({ execution: this }) },
            img: a.img,
            level: a.level,
            override: Array.from(a.override),
            reset: Array.from(a.reset),
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
        const types = CONFIG.ActiveEffect.dataModels.consequence._affinityTypes;
        const out = {};
        for (const Cls of types) {
          const affinities = this.getAffinities(Cls.TYPE, { active: true, crit });
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
          const automations = this.getAutomations(Cls.TYPE, { active: true, crit });
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
        const durationAutomations = this.getAutomations("duration", { active: true, crit });
        let durationFormula = this.source.system.duration.formula;
        durationAutomations.forEach(a => {
          durationFormula = BaseRoll.replaceFormulaData(a.substitution, {
            base: durationFormula,
            new: a.duration.formula,
          });
        });
        let durationValue = await BaseRoll.getValue(durationFormula, this.getRollData());
        if (durationValue > Number("9".repeat(30))) { durationValue = undefined; }
        return durationValue;
      }

      /**
       * @param {boolean} crit
       * @returns {Record<string, object>}
       */
      #generateEffectExpirations(crit = false) {
        const types = CONFIG.ActiveEffect.dataModels.consequence._expirationTypes;
        const out = {};
        for (const Cls of types) {
          const expirations = this.getExpirations(Cls.TYPE, { active: true, crit });
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
            _dep: this.source.system.sustained && game.settings.get("teriock", "trackSustainedConsequences")
              ? this.source.uuid
              : undefined,
            _src: this.source.uuid,
            affinities: this.#generateEffectAffinities(crit),
            applyIfDeattuned: true,
            automations: this.#generateEffectAutomations(crit),
            blocks: (await this.source.system.getPanelParts()).blocks,
            competence: { raw: this.competence.value },
            critical: crit,
            executor: this.actor?.uuid ?? null,
            expirations: this.#generateEffectExpirations(crit),
            heightened: this.heightened,
            identifier: `${this.source.forcedIdentifier}-effect`,
          },
          type: "imbuement",
        };
      }

      /** @inheritDoc */
      async _buildActivations() {
        const acts = teriock.data.pseudoDocuments.activations;
        const overrideAutomation = this.activeAutomations.find(a => a.type === "override");

        // Add feat save activation
        if (this.isFeat && !overrideAutomation?.preventFeat) {
          const featOptions = { attribute: this.source.system.featSaveAttribute };
          if (!overrideAutomation?.preventThreshold) { featOptions.threshold = this.rolls[0].total; }
          this.activations.push(new acts.FeatActivation({ options: featOptions }));
        }

        // Add block cone activation
        if (this.source.system.delivery === "cone") {
          this.activations.push(new acts.UseLocalActivation({ options: { lookup: "ability:block-cone" } }));
        }

        const makeEffect = overrideAutomation?.makeEffect ?? null;
        const targetsActor = overrideAutomation?.targetsActor ?? this.targetsActor;
        const targetsArmament = overrideAutomation?.targetsArmament ?? this.targetsArmament;
        if (
          makeEffect !== false
          && (makeEffect === true
            || (this.source.system.duration.unit !== "instant" && this.source.system.maneuver !== "passive"))
          && (targetsActor || targetsArmament)
        ) {
          // Add apply effects activation. Everything is built once per crit variant: index 0 is the normal outcome
          // and index 1 is the critical one, matching the indexes automations use in their `crit` sets.
          const variants = [];
          for (const crit of [false, true]) {
            variants.push({
              con: {
                children: this.source.subs.map(s => {
                  return { uuid: s.uuid };
                }),
                data: await this.#generateEffectConsequence(crit),
              },
              crit,
              docs: [],
              grandchildren: [],
              imb: { children: [], data: await this.#generateEffectImbuement(crit) },
            });
          }
          await this.#generateConsequenceAssociations();
          for (const v of variants) {
            const key = v.crit ? "crit" : "normal";
            v.con.data.system.associations = this.#associationMap[key];
            v.con.data.changes.push(...this.#trackerMap[key]);
          }
          const addAutomations = this.getAutomations("addDocuments", { active: true }).filter(a => !a.separate);
          for (const a of addAutomations) {
            const toAdd = await a.choose({ actor: this.actor, execution: this });
            const grandchildren = [];
            if (a.children.enabled) {
              const uuids = Array.from(a.children.uuids ?? []);
              for (const uuid of uuids) {
                const grandchild = { uuid };
                if (a.children.overrideData && a.children.data) {
                  grandchild.data = foundry.utils.deepClone(a.children.data);
                }
                grandchildren.push(grandchild);
              }
            }
            for (const [i, v] of variants.entries()) {
              if (!a.crit.has(i)) { continue; }
              if (a.attachDocuments) {
                v.con.children.push(...toAdd);
                v.imb.children.push(...toAdd);
              } else {
                v.docs.push(...toAdd);
              }
              v.grandchildren.push(...grandchildren);
            }
          }
          const transformationAutomations = this.getAutomations("transformation", { active: true });
          for (const a of transformationAutomations) {
            const toAdd = await a?.choose({ actor: this.actor });
            for (const [i, v] of variants.entries()) {
              if (a?.crit.has(i)) { v.con.data.system.transformation.uuids.push(...toAdd); }
            }
          }
          for (const v of variants) {
            this.getAutomations("override", { active: true, crit: v.crit }).forEach(a => {
              for (const effectData of [v.con.data, v.imb.data]) {
                if (a?.overrideCompetence) {
                  foundry.utils.setProperty(effectData, "system.competence.raw", a.competence.value);
                }
                if (a?.overrideData && a.data) { foundry.utils.mergeObject(effectData, a.data, { inplace: true }); }
              }
            });
          }
          const bundle = (v, kind) => {
            return {
              children: v[kind].children,
              grandchildren: v.grandchildren,
              other: v.docs,
              root: { data: v[kind].data },
            };
          };
          const [norm, crit] = variants;
          if (targetsActor) {
            this.activations.push(
              new acts.AddDocumentsActivation({
                display: { label: overrideAutomation?.display?.label || "TERIOCK.COMMANDS.ApplyEffect.label" },
                primary: bundle(norm, "con"),
                secondary: bundle(crit, "con"),
                target: "actor",
              }),
            );
          }
          if (targetsArmament) {
            this.activations.push(
              new acts.AddDocumentsActivation({
                display: { label: overrideAutomation?.display?.label || "TERIOCK.COMMANDS.ApplyEffect.armament" },
                primary: bundle(norm, "imb"),
                secondary: bundle(crit, "imb"),
                target: "armament",
              }),
            );
          }
        }

        // Add all pre-defined activations
        await super._buildActivations();

        // Replace `@h` with heightening amount in all rolls
        this.activations.filter(a => a?.type === acts.RollActivation.TYPE).forEach(a => {
          a.formula = this._heightenString(a.formula);
          a?.updateSource({ formula: this._heightenString(a.formula) });
        });
      }

      /** @inheritDoc */
      async _buildSourcePanel() {
        const panel = await super._buildSourcePanel();
        const blockStates = {
          "TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label": this.heightened,
          "TERIOCK.SYSTEMS.Ability.FIELDS.overview.fluent.label": this.competence.fluent,
          "TERIOCK.SYSTEMS.Ability.FIELDS.overview.proficient.label": this.competence.proficient,
        };
        for (const [labelKey, active] of Object.entries(blockStates)) {
          const block = panel.blocks.find(b => b.title === _loc(labelKey));
          if (!block) { continue; }
          if (active) { delete block.classes; }
          else { block.classes = [TERIOCK.display.panel.classes.faded]; }
        }
        return panel;
      }

      /** @inheritDoc */
      async _buildTags() {
        await super._buildTags();
        if (this.heightened > 0) {
          if (this.heightened === 1) { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")); }
          else { this.tags.push(
              _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", { value: this.heightened }),
            ); }
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
  );
}
