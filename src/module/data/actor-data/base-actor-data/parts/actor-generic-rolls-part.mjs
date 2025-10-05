import { TeriockRoll } from "../../../../dice/_module.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { tradecraftMessage } from "../../../../helpers/html.mjs";

/**
 * Actor data model mixin that handles common generic rolls.
 * @mixin
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockBaseActorData
     */
    class ActorGenericRollsPart extends Base {
      /**
       * Rolls a feat save for the specified attribute.
       *
       * Relevant wiki pages:
       * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
       *
       * @param {Teriock.Parameters.Actor.Attribute} attribute - The attribute to roll a feat save for.
       * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
       */
      async rollFeatSave(attribute, options = {}) {
        const data = {
          attribute,
          options,
        };
        await this.parent.hookCall("rollFeatSave", data);
        if (data.cancel) {
          return;
        }
        attribute = data.attribute;
        options = data.options;
        let rollFormula = "1d20";
        if (options.advantage && !options.disadvantage) {
          rollFormula = "2d20kh1";
        } else if (options.disadvantage && !options.advantage) {
          rollFormula = "2d20kl1";
        }
        rollFormula += ` + @att.${attribute}.save`;
        const context = {
          diceClass: "feat",
        };
        if (typeof options.threshold === "number") {
          context.threshold = options.threshold;
        }
        const roll = new TeriockRoll(rollFormula, this.parent.getRollData(), {
          context,
        });
        await roll.toMessage(
          {
            speaker: TeriockChatMessage.getSpeaker({ actor: this.parent }),
            flavor:
              (typeof options.threshold === "number"
                ? `DC ${options.threshold} `
                : "") + `${attribute.toUpperCase()} Feat Save`,
          },
          {
            rollMode: game.settings.get("core", "rollMode"),
          },
        );
      }

      /**
       * Rolls an immunity save (these always succeed).
       *
       * Relevant wiki pages:
       * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
       *
       * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollImmunity(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollImmunity", data);
        if (data.cancel) {
          return;
        }
        options = data.options;
        const chatData = {
          speaker: TeriockChatMessage.getSpeaker({ actor: this.parent }),
          title: "Immune",
          content: options.message || "No effect.",
        };
        TeriockChatMessage.applyRollMode(
          chatData,
          game.settings.get("core", "rollMode"),
        );
        await TeriockChatMessage.create(chatData);
      }

      /**
       * Rolls a resistance save.
       *
       * Relevant wiki pages:
       * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
       *
       * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollResistance(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollResistance", data);
        if (data.cancel) {
          return;
        }
        let rollFormula = "1d20";
        if (options.advantage && !options.disadvantage) {
          rollFormula = "2d20kh1";
        } else if (options.disadvantage && !options.advantage) {
          rollFormula = "2d20kl1";
        }
        rollFormula += " + @p";
        const roll = new TeriockRoll(rollFormula, this.parent.getRollData(), {
          flavor: "Resistance Save",
          context: {
            isResistance: true,
            diceClass: "resist",
            threshold: 10,
          },
        });
        await roll.evaluate();
        TeriockChatMessage.create(
          {
            speaker: TeriockChatMessage.getSpeaker({ actor: this.parent }),
            rolls: [roll],
            system: {
              extraContent: options.message,
            },
          },
          {
            rollMode: game.settings.get("core", "rollMode"),
          },
        );
      }

      /**
       * Rolls a tradecraft check.
       *
       * Relevant wiki pages:
       * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
       *
       * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft - The tradecraft to roll for.
       * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollTradecraft(tradecraft, options = {}) {
        const data = {
          tradecraft,
          options,
        };
        await this.parent.hookCall("rollTradecraft", data);
        if (data.cancel) {
          return;
        }
        tradecraft = data.tradecraft;
        options = data.options;
        const { proficient, extra } = this.tradecrafts[tradecraft] || {};
        let rollFormula = "1d20";
        if (options.advantage && !options.disadvantage) {
          rollFormula = "2d20kh1";
        } else if (options.disadvantage && !options.advantage) {
          rollFormula = "2d20kl1";
        }
        if (extra) {
          rollFormula += ` + @tc.${tradecraft.slice(0, 3)}`;
        }
        if (proficient) {
          rollFormula += " + @p";
        }
        const context = {};
        if (typeof options.threshold === "number") {
          context.threshold = options.threshold;
        }
        const roll = new TeriockRoll(rollFormula, this.parent.getRollData(), {
          flavor: `${TERIOCK.index.tradecrafts[tradecraft]} Check`,
          context,
        });
        await roll.evaluate();
        TeriockChatMessage.create(
          {
            speaker: TeriockChatMessage.getSpeaker({ actor: this.parent }),
            rolls: [roll],
            system: {
              extraContent: await tradecraftMessage(tradecraft),
            },
          },
          {
            rollMode: game.settings.get("core", "rollMode"),
          },
        );
      }
    }
  );
};
