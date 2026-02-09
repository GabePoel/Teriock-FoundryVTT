import {
  selectDocumentDialog,
  selectDocumentsDialog,
} from "../../../../applications/dialogs/select-document-dialog.mjs";
import {
  ChangesAutomation,
  CombatExpirationAutomation,
  DurationAutomation,
  RollAutomation,
  StatusAutomation,
  TransformationAutomation,
} from "../../../../data/pseudo-documents/automations/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { TeriockFolder } from "../../../../documents/_module.mjs";
import {
  addFormula,
  boostFormula,
  formulaExists,
  manipulateFormula,
} from "../../../../helpers/formula.mjs";
import { ApplyEffectHandler } from "../../../../helpers/interaction/button-handlers/apply-effect-handlers.mjs";
import { RollRollableTakeHandler } from "../../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import { FeatHandler } from "../../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import standardDamageCommand from "../../../../helpers/interaction/commands/standard-damage-command.mjs";

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
            FeatHandler.buildButton(
              this.source.system.featSaveAttribute,
              this.rolls[0].total,
            ),
          );
        }

        // Build apply effects button
        if (
          (this.mergeImpactsNumber("duration") > 0 ||
            this.source.system.duration.unit !== "instant") &&
          this.source.system.maneuver !== "passive"
        ) {
          const normalEffectData = await this.generateConsequence();
          const critEffectData = await this.generateConsequence(true);
          this.buttons.push(
            ApplyEffectHandler.buildButton(normalEffectData, {
              secondaryData: critEffectData,
              sustainingAbility: this.source,
              bonusSubs: new Set(this.source.subs.map((s) => s.uuid)),
            }),
          );
        }

        // Add armament to standard damage button
        const standardDamageButton = this.buttons.find(
          (b) => b.dataset?.action === standardDamageCommand.id,
        );
        if (standardDamageButton && this.armament) {
          standardDamageButton.dataset.armament = this.armament.uuid;
        }

        // Add merged roll automation buttons
        const rollAutomations =
          /** @type {RollAutomation[]} */ this.activeAutomations.filter(
            (a) => a.type === RollAutomation.TYPE,
          );
        const mergeRollAutomations = rollAutomations.filter((a) => a.merge);
        const rollTypes = new Set(mergeRollAutomations.map((a) => a.roll));
        for (const rollType of rollTypes) {
          let formula = "";
          mergeRollAutomations
            .filter((a) => a.roll === rollType)
            .forEach((a) => (formula = addFormula(formula, a.formula)));
          const boostAmount = this.source.system.impacts.boosts[rollType];
          if (formulaExists(boostAmount)) {
            formula = boostFormula(formula, boostAmount);
          }
          if (formula && TERIOCK.options.take[rollType]) {
            this.buttons.push(
              RollRollableTakeHandler.buildButton(rollType, formula),
            );
          }
        }

        // Add all pre-defined buttons
        await super._buildButtons();

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
          this.tags.push("Unblockable");
        }
        if (this.warded) {
          this.tags.push("Warded");
        }
        if (this.vitals) {
          this.tags.push("Vitals");
        }
        if (this.heightened > 0) {
          this.tags.push(
            `Heightened ${this.heightened} Time${this.heightened === 1 ? "" : "s"}`,
          );
        }
        if (this.costs.mp > 0) {
          this.tags.push(`${this.costs.mp} MP Spent`);
        }
        if (this.costs.hp > 0) {
          this.tags.push(`${this.costs.hp} HP Spent`);
        }
        if (this.costs.gp > 0) {
          this.tags.push(`${this.costs.gp} ₲ Spent`);
        }
      }

      /** @inheritDoc */
      async _createChatMessage() {
        await this.executePseudoHookMacros("preExecution");
        await super._createChatMessage();
      }

      /**
       * Generate the JSON serializable data for a consequence.
       * @param {boolean} crit
       * @returns {Promise<object>}
       */
      async generateConsequence(crit = false) {
        // Get statuses from automations
        const statusAutomations = this.#getCritAutomations(
          StatusAutomation,
          crit,
        );
        const statuses = statusAutomations
          .filter((a) => a.relation === "include")
          .map((a) => a.status);

        // Mutate duration with automations
        const durationAutomations = this.#getCritAutomations(
          DurationAutomation,
          crit,
        );
        let durationFormula = this.source.system.duration.formula;
        durationAutomations.forEach((a) => {
          const formula = a.duration.formula;
          durationFormula = manipulateFormula(durationFormula, formula, a.mode);
        });
        let durationValue = await TeriockRoll.getValue(
          durationFormula,
          this.rollData,
        );
        if (durationValue > Number("9".repeat(30))) {
          durationValue = undefined;
        }

        // Get changes from automations
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

        // Get combat expiration from automations
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

        // TODO: Have abilities get their pseudoHooks from automations
        changes.push(...this.source.system.pseudoHookChanges);

        // Get transformation from automations
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
          const folderUuids = transformation.uuids.filter((uuid) =>
            uuid.includes("Folder"),
          );
          const nonFolderUuids = Array.from(
            transformation.uuids.filter((uuid) => !uuid.includes("Folder")),
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
              if (transformation.multiple) {
                chosen = await selectDocumentsDialog(choices, {
                  hint: "Please one or more select species to transform into.",
                  title: "Select Species",
                  tooltipAsync: true,
                  openable: true,
                });
              } else {
                chosen = [
                  await selectDocumentDialog(choices, {
                    hint: "Please select a species to transform into.",
                    title: "Select Species",
                    tooltipAsync: true,
                    openable: true,
                  }),
                ];
              }
              if (chosen) {
                //noinspection JSValidateTypes
                transformation.uuids = chosen.map((s) => s.uuid);
              }
            }
          }
        }

        return {
          changes: [],
          duration: {
            seconds: durationValue,
          },
          img: this.source.img,
          name: `${this.source.name} Effect`,
          statuses: Array.from(statuses),
          system: {
            associations: [],
            blocks: this.source.system.panelParts.blocks,
            critical: crit,
            deleteOnExpire: true,
            expirations: {
              combat: combatExpiration,
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
              changes: changes,
            },
            source: this.source.uuid,
            transformation: transformation,
          },
          type: "consequence",
        };
      }
    }
  );
}
