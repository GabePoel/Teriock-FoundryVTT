import {
  selectDocumentDialog,
  selectDocumentsDialog,
} from "../../../../applications/dialogs/select-document-dialog.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { addFormula } from "../../../../helpers/formula.mjs";
import {
  folderContents,
  getRollIcon,
  safeUuid,
  upgradeTransformation,
} from "../../../../helpers/utils.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 * @constructor
 */
export default function AbilityExecutionChatPart(Base) {
  /**
   * @mixin
   */
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @property {TeriockAbility} source
     */
    class AbilityExecutionChat extends Base {
      /** @inheritDoc */
      async _buildButtons() {
        // Feat Save Button
        if (this.source.system.interaction === "feat") {
          const attribute = this.source.system.featSaveAttribute;
          this.buttons.push({
            label: `Roll ${attribute.toUpperCase()} Save`,
            icon: "fas fa-dice-d20",
            dataset: {
              action: "feat-save",
              attribute: attribute,
              dc: this.rolls[0].total.toString(),
            },
          });
        }

        // Apply Effect Button
        if (
          (this.mergeImpactsNumber("duration") > 0 ||
            this.source.system.duration.unit !== "instant") &&
          this.source.system.maneuver !== "passive"
        ) {
          const normalEffectData = await this.generateConsequence();
          const normalEffectJSON = JSON.stringify(normalEffectData);
          const critEffectData = await this.generateConsequence(true);
          const critEffectJSON = JSON.stringify(critEffectData);
          this.buttons.push({
            label: "Apply Effect",
            icon: "fas fa-disease",
            dataset: {
              action: "apply-effect",
              normal: normalEffectJSON || critEffectJSON,
              crit: critEffectJSON || normalEffectJSON,
              sustaining: this.source.system.sustained
                ? safeUuid(this.source.uuid)
                : "null",
            },
          });
        }

        // Macro Execution Buttons
        for (const impact of [
          this.source.system.impacts.base,
          this.source.system.impacts.proficient,
          this.source.system.impacts.fluent,
          this.source.system.impacts.heightened,
        ]) {
          for (const uuid of impact.macroButtonUuids) {
            const macroData = fromUuidSync(uuid);
            const useData = {
              rollOptions: this.rollOptions,
              abilityData: this.source.toObject(),
              costs: this.costs,
              heightened: this.heightened,
              proficient: this.proficient,
              fluent: this.fluent,
            };
            const useDataset = JSON.stringify(useData);
            const buttonData = {
              label: macroData.name,
              icon: "fas fa-code",
              dataset: {
                uuid: macroData.uuid,
                action: "execute-macro",
                use: useDataset,
              },
            };
            this.buttons.push(buttonData);
          }
        }

        // Standard Damage Button
        if (this.mergeImpactsSet("common").has("standardDamage")) {
          const buttonData = {
            label: "Standard Roll",
            icon: "fas fa-hammer-crash",
            dataset: {
              action: "standard-damage",
            },
          };
          if (this.armament) {
            buttonData.dataset.attacker = this.armament.uuid;
          }
          this.buttons.push(buttonData);
        }

        // Buttons Based on Effect Type
        const effects = this.source.system.effectTypes;

        // Resistance Button
        if (effects.has("resistance")) {
          this.buttons.push({
            label: "Roll Resistance",
            icon: "fas fa-shield-alt",
            dataset: {
              action: "resist",
            },
          });
        }

        // Awaken Button
        if (effects.has("awakening")) {
          this.buttons.push({
            label: "Awaken",
            icon: "fas fa-sunrise",
            dataset: {
              action: "awaken",
            },
          });
        }

        // Revive Buttons
        if (effects.has("revival")) {
          this.buttons.push({
            label: "Revive",
            icon: "fas fa-heart-pulse",
            dataset: {
              action: "revive",
            },
          });
          this.buttons.push({
            label: "Death Bag",
            icon: "fas fa-sack",
            dataset: {
              action: "death-bag",
            },
          });
        }

        // Heal Buttons
        if (effects.has("healing")) {
          this.buttons.push({
            label: "Heal",
            icon: "fas fa-hand-holding-heart",
            dataset: {
              action: "heal",
            },
          });
        }

        // Heal Buttons
        if (effects.has("revitalization")) {
          this.buttons.push({
            label: "Revitalize",
            icon: "fas fa-hand-holding-droplet",
            dataset: {
              action: "revitalize",
            },
          });
        }

        // Rollable Take Buttons
        const rolls = this.mergeImpactsRolls("rolls");
        Object.entries(rolls).forEach(([rollType, formula]) => {
          if (formula && TERIOCK.display.buttons.rollButtons[rollType]) {
            const buttonConfig = foundry.utils.deepClone(
              TERIOCK.display.buttons.rollButtons[rollType],
            );
            buttonConfig.icon = `fas fa-${getRollIcon(formula)}`;
            buttonConfig.dataset = {
              action: "roll-rollable-take",
              type: rollType,
              tooltip: formula,
              formula: formula,
            };
            this.buttons.push(buttonConfig);
          }
        });

        // Hack Buttons
        const hacks = this.mergeImpactsSet("hacks");
        for (const hackType of hacks) {
          const buttonConfig = foundry.utils.deepClone(
            TERIOCK.display.buttons.hackButtons[hackType],
          );
          buttonConfig.dataset = {
            action: "take-hack",
            part: hackType,
          };
          this.buttons.push(buttonConfig);
        }

        // Apply Condition Buttons
        const startStatuses = this.mergeImpactsSet("startStatuses");
        for (const status of startStatuses) {
          this.buttons.push({
            label: `Apply ${TERIOCK.index.conditions[status]}`,
            icon: "fas fa-plus",
            dataset: {
              action: "apply-status",
              status: status,
            },
          });
        }

        // Remove Condition Buttons
        const endStatuses = this.mergeImpactsSet("endStatuses");
        for (const status of endStatuses) {
          this.buttons.push({
            label: `Remove ${TERIOCK.index.conditions[status]}`,
            icon: "fas fa-xmark",
            dataset: {
              action: "remove-status",
              status: status,
            },
          });
        }

        // Tradecraft Check Buttons
        const checks = this.mergeImpactsSet("checks");
        for (const tradecraft of checks) {
          this.buttons.push({
            label: `${TERIOCK.index.tradecrafts[tradecraft]} Check`,
            icon: "fas fa-compass-drafting",
            dataset: {
              action: "tradecraft-check",
              tradecraft: tradecraft,
            },
          });
        }
      }

      /** @inheritDoc */
      async _buildTags() {
        if (this.source.system.interaction === "attack" && this.ub) {
          this.tags.push("Unblockable");
        }
        if (this.warded) {
          this.tags.push("Warded");
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

      async generateConsequence(crit = false) {
        const statuses = this.mergeImpactsSet("statuses");
        const seconds = this.mergeImpactsNumber("duration");
        const expirations = this.mergeImpactsExpiration("expiration", crit);
        expirations.normal.combat.who.source = this.actor?.uuid;
        let changes = foundry.utils.deepClone(
          this.mergeImpactsChanges("changes"),
        );
        changes = await Promise.all(
          changes.map(async (c) => {
            const roll = new TeriockRoll(c.value, this.rollData);
            await roll.evaluate();
            c.value = roll.total.toString();
            return c;
          }),
        );
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
            ...(await folderContents(folderUuid, { types: ["species"] })),
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
          name: `${this.source.name} Effect`,
          type: "consequence",
          img: this.source.img,
          changes: changes,
          statuses: Array.from(statuses),
          system: {
            associations: [],
            blocks: this.source.system.messageParts.blocks,
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
              dawn: this.source.system.duration.unit === "untilDawn",
              sustained: this.source.system.sustained,
              description: this.source.system.endCondition,
            },
            heightened: this.heightened,
            hierarchy: {
              subIds: Array.from(
                this.source.system.hierarchy.subIds || new Set(),
              ),
              rootUuid: this.source.parent.uuid,
            },
            source: this.source.uuid,
            transformation: transformation,
          },
          duration: {
            seconds: seconds,
          },
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
