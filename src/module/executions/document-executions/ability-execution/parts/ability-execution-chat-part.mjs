import {
  selectDocumentDialog,
  selectDocumentsDialog,
} from "../../../../applications/dialogs/select-document-dialog.mjs";
import {
  ChangesAutomation,
  RollAutomation,
  StatusAutomation,
} from "../../../../data/pseudo-documents/automations/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { TeriockFolder } from "../../../../documents/_module.mjs";
import {
  addFormula,
  boostFormula,
  formulaExists,
} from "../../../../helpers/formula.mjs";
import { ApplyEffectHandler } from "../../../../helpers/interaction/button-handlers/apply-effect-handlers.mjs";
import { RollRollableTakeHandler } from "../../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import { FeatHandler } from "../../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import standardDamageCommand from "../../../../helpers/interaction/commands/standard-damage-command.mjs";
import { upgradeTransformation } from "../../../../helpers/utils.mjs";

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
        const statusAutomations = this.#getCritAutomations(
          StatusAutomation,
          crit,
        );
        const statuses = statusAutomations
          .filter((a) => a.relation === "include")
          .map((a) => a.status);

        //const durationAutomations = this.#getCritAutomations(
        //  DurationAutomation,
        //  crit,
        //);

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

        let seconds = this.mergeImpactsNumber("duration");
        const interval = this.source.system.impacts.heightened.duration;
        if (interval) seconds = Math.round(seconds / interval) * interval;
        const expirations = this.mergeImpactsExpiration("expiration", crit);
        expirations.normal.combat.who.source = this.actor?.uuid;
        //let changes = foundry.utils.deepClone(
        //  this.mergeImpactsChanges("changes"),
        //);
        //changes = changes.map((c) => {
        //  c.value = this._heightenString(c.value);
        //  return c;
        //});
        changes.push(...this.source.system.pseudoHookChanges);
        const transformation =
          this.mergeImpactsTransformation("transformation");
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
        return {
          changes: [],
          duration: {
            seconds: seconds,
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
              combat: expirations.normal.combat,
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

      /**
       * @param {string} property
       * @returns {EffectChangeData[]}
       */
      mergeImpactsChanges(property) {
        const method = (a, b) => [...a, ...b];
        return this.mergeImpacts(property, method);
      }

      /**
       * Merge impact expirations.
       * @param {string} property
       * @param {boolean} [crit]
       * @returns {AbilityExpirations}
       */
      mergeImpactsExpiration(property, crit = false) {
        /**
         * @param {AbilityExpirations} a
         * @returns {AbilityExpirations}
         */
        function baseMethod(a) {
          a = foundry.utils.deepClone(a);
          if (a.doesExpire && crit && a.changeOnCrit) {
            a.normal = a.crit;
          }
          return a;
        }

        /**
         * This handles all the crit considerations. All combat expirations will be compressed into `normal`.
         * @param {AbilityExpirations} a
         * @param {AbilityExpirations} b
         * @returns {AbilityExpirations}
         */
        function method(a, b) {
          b = foundry.utils.deepClone(b);
          if (b.doesExpire && crit && b.changeOnCrit) {
            b.normal = b.crit;
          }
          let c = a;
          if (b.doesExpire) {
            c = foundry.utils.mergeObject(a, b);
          }
          return c;
        }

        return this.mergeImpacts(property, method, { baseMethod });
      }

      /**
       * Merge impact rolls.
       * @param {string} property
       * @returns {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>}
       */
      mergeImpactsRolls(property) {
        const method = (a, b) => foundry.utils.mergeObject(a, b);
        const rollData = this.rollData;
        const heightened = this.heightened;

        /**
         * @param {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} a
         * @param {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} b
         * @returns {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>}
         */
        function heightenedMethod(a, b) {
          const c = foundry.utils.deepClone(a);
          for (const [key, value] of Object.entries(b)) {
            const rollRoll = new TeriockRoll(value, rollData);
            rollRoll.alter(heightened, 0, { multiplyNumeric: true });
            c[key] = addFormula(a[key] || "", rollRoll.formula);
          }
          return c;
        }

        return this.mergeImpacts(property, method, { heightenedMethod });
      }

      /**
       * Merge impact transformations.
       * @param {string} property
       * @returns {TransformationConfigurationField}
       */
      mergeImpactsTransformation(property) {
        /**
         * @param {TransformationConfigurationField} a
         */
        function baseMethod(a) {
          const b = foundry.utils.deepClone(a);
          if (b.useFolder && b.uuid) {
            //noinspection JSValidateTypes
            b.uuids = new Set([b.uuid]);
          }
          return b;
        }

        /**
         * @param {TransformationConfigurationField} a
         * @param {TransformationConfigurationField} b
         * @returns {TransformationConfigurationField}
         */
        function method(a, b) {
          a = foundry.utils.deepClone(a);
          b = foundry.utils.deepClone(b);
          let newUuids = Array.from(b.uuids);
          if (b.useFolder && b.uuid) {
            newUuids = [b.uuid];
          }
          let c = a;
          if (b.enabled) {
            c = {
              enabled: b.enabled || a.enabled,
              image: b.image || a.image,
              select: b.select || a.select,
              multiple: b.multiple || a.multiple,
              level: upgradeTransformation(b.level, a.level),
              uuids: new Set([...Array.from(a.uuids), ...newUuids]),
              useFolder: a.useFolder || b.useFolder,
              uuid: b.uuid || a.uuid,
              resetHp: b.resetHp,
              resetMp: b.resetMp,
              suppression: b.suppression,
            };
          }
          return c;
        }

        return this.mergeImpacts(property, method, { baseMethod });
      }
    }
  );
}
