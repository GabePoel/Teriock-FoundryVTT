import {
  selectDocumentDialog,
  selectDocumentsDialog,
} from "../../../../applications/dialogs/select-document-dialog.mjs";
import { conditionDialog } from "../../../../applications/dialogs/select-token-dialog.mjs";
import {
  AbilityMacroAutomation,
  ChangesAutomation,
  CombatExpirationAutomation,
  DurationAutomation,
  StatusAutomation,
  TransformationAutomation,
} from "../../../../data/pseudo-documents/automations/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { TeriockFolder } from "../../../../documents/_module.mjs";
import { manipulateFormula } from "../../../../helpers/formula.mjs";
import { ApplyEffectHandler } from "../../../../helpers/interaction/button-handlers/apply-effect-handlers.mjs";
import { RollRollableTakeHandler } from "../../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import {
  FeatHandler,
  StandardDamageHandler,
} from "../../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
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
          title: game.i18n.format(
            "TERIOCK.SYSTEMS.Ability.PANELS.statusWithRespectTo",
            { status: TERIOCK.reference.conditions[automation.status] },
          ),
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
       * @param {Teriock.Parameters.Condition.ConditionKey} status
       * @param {UUID<TeriockTokenDocument|TeriockActor>} uuid
       * @returns {Teriock.Changes.QualifiedChangeData}
       */
      #generateConditionTracker(status, uuid) {
        return {
          key: `system.conditionInformation.${status}.trackers`,
          value: safeUuid(uuid),
          mode: 2,
          priority: 10,
          target: "Actor",
          qualifier: "1",
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
          name: game.i18n.format(
            "TERIOCK.SYSTEMS.Ability.EXECUTION.effectName",
            { name: this.source.name },
          ),
          statuses: this.#generateConsequenceStatuses(crit),
          system: {
            associations: [],
            blocks: this.source.system.panelParts.blocks,
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
              movement: this.source.system.duration.stationary,
              dawn: this.source.system.duration.dawn,
              sustained: this.source.system.sustained,
              description: this.source.system.endCondition,
            },
            heightened: this.heightened,
            impacts: {
              changes: this.#generateConsequenceChanges(crit),
            },
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
       * @returns {object[]}
       */
      #generateConsequenceChanges(crit = false) {
        const changesAutomations = this.#getCritAutomations(
          ChangesAutomation,
          crit,
        );
        const changes = [];
        changesAutomations.forEach((a) => {
          changes.push(...foundry.utils.deepClone(a.changes));
        });
        changes.forEach((c) => {
          c.value = this._heightenString(c.value);
        });
        const macroAutomations = this.#getCritAutomations(
          AbilityMacroAutomation,
          crit,
        );
        const pseudoHookChanges = macroAutomations
          .filter((a) => a.relation === "pseudoHook" && a.hasMacro)
          .map((a) => a.pseudoHookChange);
        changes.push(...pseudoHookChanges);
        return changes;
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
        durationAutomations.forEach((a) => {
          const formula = a.duration.formula;
          durationFormula = manipulateFormula(durationFormula, formula, a.mode);
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
       * @returns {Teriock.Parameters.Consequence.RollConsequenceKey[]}
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
       * @returns {Promise<Partial<TransformationConfigurationField>>}
       */
      async #generateConsequenceTransformation(crit = false) {
        const transformationAutomations = this.#getCritAutomations(
          TransformationAutomation,
          crit,
        );
        /** @type {Partial<TransformationConfigurationField>} */
        const transformation = { enabled: !!transformationAutomations.length };
        if (transformation.enabled) {
          transformationAutomations.forEach((a) => {
            Object.assign(transformation, a.transformation);
          });
          const uuids = [
            transformation.uuid,
            ...Array.from(transformation.uuids),
          ].filter((uuid) => typeof uuid === "string");
          const folderUuids = uuids.filter((uuid) => uuid.includes("Folder"));
          const nonFolderUuids = Array.from(
            uuids.filter((uuid) => !uuid.includes("Folder")),
          );
          for (const folderUuid of folderUuids) {
            nonFolderUuids.push(
              ...(await TeriockFolder.getContents(folderUuid, {
                types: ["species"],
              })),
            );
          }
          //noinspection JSValidateTypes
          transformation.uuids = nonFolderUuids;
          if (!crit) {
            const choices = transformation.uuids.map((uuid) =>
              fromUuidSync(uuid),
            );
            if (transformation.select) {
              let chosen;
              const options = {
                hint: game.i18n.localize(
                  "TERIOCK.DIALOGS.Select.Transformation.hint",
                ),
                openable: true,
                title: game.i18n.localize(
                  "TERIOCK.DIALOGS.Select.Transformation.title",
                ),
                tooltipAsync: true,
              };
              if (transformation.multiple) {
                chosen = await selectDocumentsDialog(choices, options);
              } else {
                chosen = [await selectDocumentDialog(choices, options)];
              }
              if (chosen) {
                //noinspection JSValidateTypes
                transformation.uuids = chosen.map((s) => s.uuid);
              }
            }
          }
        }
        return transformation;
      }

      /**
       * Get all active automations of a given type.
       * @template T
       * @param {T} automation
       * @param {boolean} crit
       * @returns {T[]}
       */
      #getCritAutomations(automation, crit) {
        const automations =
          /** @type {CritAutomation[]} */ this.activeAutomations;
        return automations.filter(
          (a) =>
            a.type === automation.TYPE &&
            ((crit && a.crit?.has(1)) || (!crit && a.crit?.has(0))),
        );
      }

      /** @inheritDoc */
      async _buildButtons() {
        // Build feat save button
        if (this.source.system.interaction === "feat") {
          this.buttons.push(
            FeatHandler.buildButton(this.source.system.featSaveAttribute, {
              threshold: this.rolls[0].total,
            }),
          );
        }

        // Build apply effects button
        if (
          this.source.system.duration.unit !== "instant" &&
          this.source.system.maneuver !== "passive"
        ) {
          const normalEffectData = await this.#generateConsequence(false);
          const critEffectData = await this.#generateConsequence(true);
          await this.#generateConsequenceAssociations();
          normalEffectData.system.associations = this.#associationMap["normal"];
          normalEffectData.system.impacts.changes.push(
            ...this.#trackerMap["normal"],
          );
          critEffectData.system.associations = this.#associationMap["crit"];
          critEffectData.system.impacts.changes.push(
            ...this.#trackerMap["crit"],
          );
          this.buttons.push(
            ApplyEffectHandler.buildButton(normalEffectData, {
              secondaryData: critEffectData,
              sustainingAbility: this.source,
              bonusSubs: new Set(this.source.subs.map((s) => s.uuid)),
            }),
          );
        }

        // Add all pre-defined buttons
        await super._buildButtons();

        // Add armament to the standard damage button
        const standardDamageButton = this.buttons.find(
          (b) => b.dataset?.action === StandardDamageHandler.ACTION,
        );
        if (standardDamageButton && this.armament) {
          standardDamageButton.dataset.attacker = this.armament.uuid;
        }

        // Replace `@h` with heighten amount in all rolls
        this.buttons
          .filter((b) => b.dataset?.action === RollRollableTakeHandler.ACTION)
          .forEach((b) => {
            b.dataset.formula = this._heightenString(b.dataset.formula);
          });
      }

      /** @inheritDoc */
      async _buildTags() {
        if (this.source.system.interaction === "attack" && this.ub) {
          this.tags.push(
            game.i18n.localize("TERIOCK.TERMS.Properties.unblockable"),
          );
        }
        if (this.warded) {
          this.tags.push(
            game.i18n.localize("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label"),
          );
        }
        if (this.vitals) {
          this.tags.push(game.i18n.localize("TERIOCK.TERMS.Targets.vitals"));
        }
        if (this.heightened > 0) {
          if (this.heightened === 1) {
            this.tags.push(
              game.i18n.localize(
                "TERIOCK.SYSTEMS.Consequence.PANELS.heightenedSingle",
              ),
            );
          } else {
            this.tags.push(
              game.i18n.format(
                "TERIOCK.SYSTEMS.Consequence.PANELS.heightenedPlural",
                { value: this.heightened },
              ),
            );
          }
        }
        if (this.costs.mp > 0) {
          this.tags.push(
            game.i18n.format("TERIOCK.SYSTEMS.Consequence.PANELS.spentMp", {
              amount: this.costs.mp,
            }),
          );
        }
        if (this.costs.hp > 0) {
          this.tags.push(
            game.i18n.format("TERIOCK.SYSTEMS.Consequence.PANELS.spentHp", {
              amount: this.costs.hp,
            }),
          );
        }
        if (this.costs.gp > 0) {
          this.tags.push(
            game.i18n.format("TERIOCK.SYSTEMS.Consequence.PANELS.spentGp", {
              amount: this.costs.gp,
            }),
          );
        }
      }
    }
  );
}
