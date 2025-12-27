import {
  selectDocumentDialog,
  selectDocumentsDialog,
} from "../../../../applications/dialogs/select-document-dialog.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { TeriockFolder } from "../../../../documents/_module.mjs";
import { addFormula } from "../../../../helpers/formula.mjs";
import { ApplyEffectHandler } from "../../../../helpers/interaction/button-handlers/apply-effect-handlers.mjs";
import { ExecuteMacroHandler } from "../../../../helpers/interaction/button-handlers/execute-macro-handlers.mjs";
import { RollRollableTakeHandler } from "../../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import {
  ApplyStatusHandler,
  AwakenHandler,
  DeathBagHandler,
  FeatHandler,
  HealHandler,
  RemoveStatusHandler,
  ResistHandler,
  RevitalizeHandler,
  ReviveHandler,
  StandardDamageHandler,
  TakeHackHandler,
  TradecraftCheckHandler,
  UseAbilityHandler,
} from "../../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import { upgradeTransformation } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionChatPart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @mixin
     * @property {TeriockAbility} source
     */
    class AbilityExecutionChat extends Base {
      /** @inheritDoc */
      async _buildButtons() {
        // Feat Save Button
        if (this.source.system.interaction === "feat") {
          this.buttons.push(
            FeatHandler.buildButton(
              this.source.system.featSaveAttribute,
              this.rolls[0].total,
            ),
          );
        }

        // Apply Effect Button
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

        // Macro Execution Buttons
        for (const impact of [
          this.source.system.impacts.base,
          this.source.system.impacts.proficient,
          this.source.system.impacts.fluent,
          this.source.system.impacts.heightened,
        ]) {
          for (const uuid of impact.macroButtonUuids) {
            const data = {
              rollOptions: this.rollOptions,
              abilityData: this.source.toObject(),
              costs: this.costs,
              heightened: this.heightened,
              proficient: this.proficient,
              fluent: this.fluent,
            };
            this.buttons.push(ExecuteMacroHandler.buildButton(uuid, data));
          }
        }

        // Standard Damage Button
        if (this.mergeImpactsSet("common").has("standardDamage")) {
          this.buttons.push(
            StandardDamageHandler.buildButton(this.armament?.uuid),
          );
        }

        // Buttons Based on Effect Type
        const effects = this.source.system.effectTypes;

        // Resistance Buttons
        if (effects.has("resistance")) {
          this.buttons.push(ResistHandler.buildButton());
        }
        if (effects.has("hexproof")) {
          this.buttons.push(ResistHandler.buildButton(true));
        }

        // Awaken Button
        if (effects.has("awakening")) {
          this.buttons.push(AwakenHandler.buildButton());
        }

        // Revive Buttons
        if (effects.has("revival")) {
          this.buttons.push(ReviveHandler.buildButton());
          this.buttons.push(DeathBagHandler.buildButton());
        }

        // Heal Buttons
        if (effects.has("healing")) {
          this.buttons.push(HealHandler.buildButton());
        }

        // Heal Buttons
        if (effects.has("revitalization")) {
          this.buttons.push(RevitalizeHandler.buildButton());
        }

        // Rollable Take Buttons
        const rolls = this.mergeImpactsRolls("rolls");
        Object.entries(rolls).forEach(([rollType, formula]) => {
          if (formula && TERIOCK.options.take[rollType]) {
            this.buttons.push(
              RollRollableTakeHandler.buildButton(rollType, formula),
            );
          }
        });

        // Hack Buttons
        const hacks = this.mergeImpactsSet("hacks");
        for (const part of hacks) {
          this.buttons.push(TakeHackHandler.buildButton(part));
        }

        // Apply Condition Buttons
        const startStatuses = this.mergeImpactsSet("startStatuses");
        for (const status of startStatuses) {
          this.buttons.push(ApplyStatusHandler.buildButton(status));
        }

        // Remove Condition Buttons
        const endStatuses = this.mergeImpactsSet("endStatuses");
        for (const status of endStatuses) {
          this.buttons.push(RemoveStatusHandler.buildButton(status));
        }

        // Tradecraft Check Buttons
        const checks = this.mergeImpactsSet("checks");
        for (const tradecraft of checks) {
          this.buttons.push(TradecraftCheckHandler.buildButton(tradecraft));
        }

        // Ability Use Buttons
        const abilityNames = this.mergeImpactsSet("abilityButtonNames");
        for (const abilityName of abilityNames) {
          this.buttons.push(UseAbilityHandler.buildButton(abilityName));
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
        if (crit) {
          const critStatuses = this.mergeImpactsSet("critStatuses");
          for (const status of critStatuses) {
            statuses.add(status);
          }
        }
        let seconds = this.mergeImpactsNumber("duration");
        const interval = this.source.system.impacts.heightened.duration;
        if (interval) seconds = Math.round(seconds / interval) * interval;
        const expirations = this.mergeImpactsExpiration("expiration", crit);
        expirations.normal.combat.who.source = this.actor?.uuid;
        let changes = foundry.utils.deepClone(
          this.mergeImpactsChanges("changes"),
        );
        changes = await Promise.all(
          changes.map(async (c) => {
            const regex = /@h(?![a-zA-Z])/g;
            if (regex.test(c.value)) {
              c.value = c.value.replace(
                regex,
                (this.heightened || 0).toString(),
              );
            }
            return c;
          }),
        );
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
              dawn: this.source.system.duration.unit === "untilDawn",
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
