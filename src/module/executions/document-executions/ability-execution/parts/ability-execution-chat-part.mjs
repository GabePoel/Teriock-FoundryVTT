import { conditionDialog } from "../../../../applications/dialogs/select-token-dialog.mjs";
import { costOptions } from "../../../../constants/options/cost-options.mjs";
import { FormulaField } from "../../../../data/fields/_module.mjs";
import {
  AddExternalDocumentsAutomation,
  ChangesAutomation,
  CombatExpirationAutomation,
  DurationAutomation,
  ModifyEffectAutomation,
  StatusAutomation,
  TransformationAutomation,
} from "../../../../data/pseudo-documents/automations/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { safeUuid } from "../../../../helpers/resolve.mjs";

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
      /** @type {Record<string, Teriock.MessageData.MessageAssociation[]>} */
      #associationMap;

      /** @type {Record<string, Teriock.Changes.QualifiedChangeData[]>} */
      #trackerMap;

      /**
       * @param {Teriock.MessageData.MessageAssociation} association
       * @param {string} key
       */
      #addAssociationToMap(association, key) {
        const associations = this.#associationMap[key];
        const existing = associations.find(
          (a) => a.title === association.title,
        );
        if (!existing) {
          associations.push(association);
        } else {
          existing.cards.push(
            ...association.cards.filter(
              (c) => !existing.cards.map((e) => e.uuid).includes(c.uuid),
            ),
          );
        }
      }

      /**
       * @param {Teriock.Changes.QualifiedChangeData[]} trackers
       * @param {string} key
       */
      #addTrackersToMap(trackers, key) {
        this.#trackerMap[key].push(
          ...trackers.filter(
            (t) => !this.#trackerMap[key].map((e) => e.value).includes(t.value),
          ),
        );
      }

      /**
       * @param {StatusAutomation} automation
       * @param {UUID<TeriockTokenDocument|TeriockActor>[]} uuids
       */
      #attachTrackedStatusAutomationUuids(automation, uuids) {
        /** @type {Teriock.MessageData.MessageAssociation} */
        const association = {
          title: _loc("TERIOCK.SYSTEMS.Ability.PANELS.statusWithRespectTo", {
            status: TERIOCK.reference.conditions[automation.status],
          }),
          icon: TERIOCK.options.document.creature.icon,
          cards: uuids.map((uuid) => this.#generateAssociationCard(uuid)),
        };
        const trackers = uuids.map((uuid) =>
          this.#generateConditionTracker(automation.status, uuid),
        );
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
       * @returns {Teriock.MessageData.MessageAssociationCard}
       */
      #generateAssociationCard(uuid) {
        const doc = fromUuidSync(uuid);
        return {
          name: doc.name,
          img: doc.imageLive || doc.img,
          uuid,
          rescale: doc.rescale,
          id: doc.id,
          type: "base",
        };
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
          value: safeUuid(uuid),
          mode: 2,
          priority: 10,
        };
      }

      /**
       * Generate the JSON serializable data for a consequence.
       * @param {boolean} crit
       * @returns {Promise<object>}
       */
      async #generateConsequence(crit = false) {
        return {
          changes: [],
          duration: {
            seconds: await this.#generateConsequenceDuration(crit),
          },
          img: this.source.img,
          name: _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", {
            name: this.source.name,
          }),
          statuses: this.#generateConsequenceStatuses(crit),
          system: {
            _dep:
              this.source.system.sustained &&
              game.teriock.getSetting("trackSustainedConsequences")
                ? this.source.uuid
                : undefined,
            associations: [],
            automations: this.#generateConsequenceAutomations(crit),
            blocks: this.source.system.panelParts.blocks,
            competence: { raw: this.competence.value },
            critical: crit,
            deleteOnExpire: true,
            expirations: {
              combat: this.#generateConsequenceCombatExpiration(crit),
              conditions: {
                absent: Array.from(
                  this.source.system.duration.conditions.absent,
                ),
                present: Array.from(
                  this.source.system.duration.conditions.present,
                ),
              },
              description: this.source.system.endCondition,
              sustained: this.source.system.sustained,
              triggers: Array.from(this.source.system.duration.triggers),
            },
            heightened: this.heightened,
            identifier: this.source.forcedIdentifier + "-effect",
            source: this.source.uuid,
            transformation: await this.#generateConsequenceTransformation(crit),
          },
          type: "consequence",
        };
      }

      /**
       * Generate associations for both crit and normal consequences.
       * @returns {Promise<void>}
       */
      async #generateConsequenceAssociations() {
        this.#associationMap = { crit: [], normal: [] };
        this.#trackerMap = { crit: [], normal: [] };
        const statusAutomations =
          /** @type {StatusAutomation[]} */ this.activeAutomations.filter(
            (a) => a.type === StatusAutomation.TYPE,
          );
        const targetAutomations = statusAutomations.filter((a) => a.target);
        for (const a of targetAutomations) {
          const uuids = await conditionDialog(a.status);
          this.#attachTrackedStatusAutomationUuids(a, uuids);
        }
        const executorAutomations = statusAutomations.filter((a) => a.executor);
        for (const a of executorAutomations) {
          const uuid =
            this.actor.defaultToken?.document?.uuid || this.actor?.uuid;
          if (uuid) {
            this.#attachTrackedStatusAutomationUuids(a, [uuid]);
          }
        }
      }

      /**
       * @param {boolean} crit
       * @returns {Record<string, object>}
       */
      #generateConsequenceAutomations(crit = false) {
        const types =
          CONFIG.ActiveEffect.dataModels.consequence._automationTypes;
        const out = {};
        for (const Cls of types) {
          const automations = this.#getCritAutomations(Cls, crit);
          for (const a of automations) {
            const data = a.toObject();
            data._id = foundry.utils.randomID();
            if (data?.type === ChangesAutomation.TYPE) {
              data?.changes.forEach((c) => {
                c.value = this._heightenString(c.value);
              });
            }
            out[data._id] = data;
          }
        }
        return out;
      }

      /**
       * @param {boolean} crit
       * @returns {Partial<CombatExpiration>}
       */
      #generateConsequenceCombatExpiration(crit = false) {
        /** @type {Partial<CombatExpiration>} */
        const combatExpiration = {};
        const combatExpirationAutomations = this.#getCritAutomations(
          CombatExpirationAutomation,
          crit,
        );
        combatExpirationAutomations.forEach((a) => {
          Object.assign(
            combatExpiration,
            foundry.utils.deepClone({
              what: a.what,
              when: a.when,
              who: a.who,
            }),
          );
          combatExpiration.who.source = this.actor?.uuid;
        });
        return combatExpiration;
      }

      /**
       * @param {boolean} crit
       * @returns {Promise<number>}
       */
      async #generateConsequenceDuration(crit = false) {
        const durationAutomations = this.#getCritAutomations(
          DurationAutomation,
          crit,
        );
        let durationFormula = this.source.system.duration.formula;
        const formulaField = new FormulaField({ deterministic: false });
        durationAutomations.forEach((a) => {
          const formula = a.duration.formula;
          const change = {
            type: a.changeType,
            effect: this.source,
            value: formula,
            phase: "initial",
            priority: 5,
            key: "duration",
          };
          durationFormula = formulaField.applyChange(
            durationFormula,
            null,
            change,
            { replacementData: this.rollData },
          );
        });
        let durationValue = await BaseRoll.getValue(
          durationFormula,
          this.rollData,
        );
        if (durationValue > Number("9".repeat(30))) {
          durationValue = undefined;
        }
        return durationValue;
      }

      /**
       * @param {boolean} crit
       * @returns {Teriock.Keys.Status[]}
       */
      #generateConsequenceStatuses(crit = false) {
        const statusAutomations = this.#getCritAutomations(
          StatusAutomation,
          crit,
        );
        return statusAutomations
          .filter((a) => a.relation === "include")
          .map((a) => a.status);
      }

      /**
       * @param {boolean} crit
       * @returns {Promise<Partial<EffectTransformationConfig>>}
       */
      async #generateConsequenceTransformation(crit = false) {
        const transformationAutomations = this.#getCritAutomations(
          TransformationAutomation,
          crit,
        );
        const transformation = {
          enabled: !!transformationAutomations.length,
          uuids: [],
        };
        if (transformation.enabled) {
          const a = transformationAutomations[0];
          const competence = a.competence.toObject();
          if (!a.overrideCompetence) competence.raw = this.competence.value;
          Object.assign(transformation, {
            competence,
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
       * Get all active automations of a given type.
       * @template T
       * @param {typeof T} Cls
       * @param {boolean} crit
       * @returns {T[]}
       */
      #getCritAutomations(Cls, crit) {
        return this.activeAutomations.filter(
          (a) =>
            a.type === Cls.TYPE &&
            ((crit && a.crit?.has(1)) || (!crit && a.crit?.has(0))),
        );
      }

      /** @inheritDoc */
      async _buildActivations() {
        const acts = teriock.data.pseudoDocuments.activations;

        // Add feat save activation
        if (this.isFeat) {
          this.activations.push(
            new acts.FeatActivation({
              options: {
                attribute: this.source.system.featSaveAttribute,
                threshold: this.rolls[0].total,
              },
            }),
          );
        }

        // Add block cone activation
        if (this.source.system.delivery === "cone" && !this.flags.noTemplate) {
          this.activations.push(
            new acts.UseLocalActivation({
              options: { lookup: "ability:block-cone" },
            }),
          );
        }

        const modifyEffectAutomation = this.activeAutomations.find(
          (a) => a.type === "modifyEffect",
        );

        if (
          this.source.system.duration.unit !== "instant" &&
          this.source.system.maneuver !== "passive" &&
          !modifyEffectAutomation?.prevent
        ) {
          // Add apply effects activation
          const normalData = await this.#generateConsequence(false);
          const critData = await this.#generateConsequence(true);
          await this.#generateConsequenceAssociations();
          normalData.system.associations = this.#associationMap["normal"];
          normalData.changes.push(...this.#trackerMap["normal"]);
          critData.system.associations = this.#associationMap["crit"];
          critData.changes.push(...this.#trackerMap["crit"]);
          const normalChildren = this.source.subs.map((s) => {
            return {
              uuid: s.uuid,
            };
          });
          const critChildren = [...normalChildren];
          const normalDocuments = [];
          const critDocuments = [];
          const childAutomations =
            /** @type {AddExternalDocumentsAutomation[]} */ this.activeAutomations.filter(
              (a) => [AddExternalDocumentsAutomation.TYPE].includes(a.type),
            );
          for (const a of childAutomations) {
            const toAdd = await a.choose();
            if (a.crit.has(0)) {
              if (a.attachDocuments) normalChildren.push(...toAdd);
              else normalDocuments.push(...toAdd);
            }
            if (a.crit.has(1)) {
              if (a.attachDocuments) critChildren.push(...toAdd);
              else critDocuments.push(...toAdd);
            }
          }
          const transformationAutomations =
            /** @type {TransformationAutomation[]} */ this.activeAutomations.filter(
              (a) => [TransformationAutomation.TYPE].includes(a.type),
            );
          for (const a of transformationAutomations) {
            const toAdd = await a.choose();
            if (a.crit.has(0)) {
              normalData.system.transformation.uuids.push(...toAdd);
            }
            if (a.crit.has(1)) {
              critData.system.transformation.uuids.push(...toAdd);
            }
          }
          this.#getCritAutomations(ModifyEffectAutomation, false).forEach(
            (a) => {
              if (a.overrideCompetence) {
                foundry.utils.setProperty(
                  normalData,
                  "system.competence.raw",
                  a.competence.value,
                );
              }
              if (a.overrideData && a.data) {
                foundry.utils.mergeObject(normalData, a.data, {
                  inplace: true,
                });
              }
            },
          );
          this.#getCritAutomations(ModifyEffectAutomation, true).forEach(
            (a) => {
              if (a.overrideCompetence) {
                foundry.utils.setProperty(
                  critData,
                  "system.competence.raw",
                  a.competence.value,
                );
              }
              if (a.overrideData && a.data) {
                foundry.utils.mergeObject(critData, a.data, {
                  inplace: true,
                });
              }
            },
          );
          this.activations.push(
            new acts.AddDocumentsActivation({
              display: {
                label:
                  modifyEffectAutomation?.display?.label ||
                  "TERIOCK.COMMANDS.ApplyEffect.label",
              },
              primary: {
                root: {
                  data: normalData,
                },
                children: normalChildren,
                other: normalDocuments,
              },
              secondary: {
                root: {
                  data: critData,
                },
                children: critChildren,
                other: critDocuments,
              },
            }),
          );
        }

        // Add all pre-defined activations
        await super._buildActivations();

        // Add armament to the standard damage activation
        const sda = this.activations.find(
          (a) => a.type === acts.StandardDamageActivation.TYPE,
        );
        if (sda && this.armament) {
          foundry.utils.setProperty(
            sda,
            "options.attacker",
            this.armament.uuid,
          );
        }

        // Replace `@h` with heighten amount in all rolls
        this.activations
          .filter((a) => a.type === acts.RollActivation.TYPE)
          .forEach((a) => {
            a.formula = this._heightenString(a.formula);
          });
      }

      /** @inheritDoc */
      async _buildSourcePanel() {
        const panel = await super._buildSourcePanel();
        const proficientBlock = panel.blocks.find(
          (b) =>
            b.title ===
            _loc("TERIOCK.SYSTEMS.Ability.FIELDS.overview.proficient.label"),
        );
        if (proficientBlock) {
          if (this.competence.proficient) {
            delete proficientBlock.classes;
          } else {
            proficientBlock.classes = [TERIOCK.display.panel.classes.faded];
          }
        }
        const fluentBlock = panel.blocks.find(
          (b) =>
            b.title ===
            _loc("TERIOCK.SYSTEMS.Ability.FIELDS.overview.fluent.label"),
        );
        if (fluentBlock) {
          if (this.competence.fluent) {
            delete fluentBlock.classes;
          } else {
            fluentBlock.classes = [TERIOCK.display.panel.classes.faded];
          }
        }
        const heightenedBlock = panel.blocks.find(
          (b) =>
            b.title === _loc("TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label"),
        );
        if (heightenedBlock) {
          if (this.heightened) {
            delete heightenedBlock.classes;
          } else {
            heightenedBlock.classes = [TERIOCK.display.panel.classes.faded];
          }
        }
        return panel;
      }

      /** @inheritDoc */
      async _buildTags() {
        if (this.source.system.interaction === "attack" && this.ub) {
          this.tags.push(_loc("TERIOCK.TERMS.Properties.unblockable"));
        }
        if (this.warded) {
          this.tags.push(_loc("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label"));
        }
        if (this.vitals) {
          this.tags.push(_loc("TERIOCK.TERMS.Targets.vitals"));
        }
        if (this.heightened > 0) {
          if (this.heightened === 1) {
            this.tags.push(
              _loc("TERIOCK.SYSTEMS.Consequence.PANELS.heightenedSingle"),
            );
          } else {
            this.tags.push(
              _loc("TERIOCK.SYSTEMS.Consequence.PANELS.heightenedPlural", {
                value: this.heightened,
              }),
            );
          }
        }
        for (const c of Object.keys(this.costs).filter(
          (c) => this.costs[c] > 0,
        )) {
          this.tags.push(
            _loc("TERIOCK.SYSTEMS.Consequence.PANELS.spent", {
              amount: this.costs[c],
              label: costOptions.primary.keys[c]?.abbreviation,
            }),
          );
        }
      }
    }
  );
}
