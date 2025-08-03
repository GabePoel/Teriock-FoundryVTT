import TeriockRoll from "../../../../../documents/roll.mjs";

const { DialogV2 } = foundry.applications.api;

/**
 * Rolls to remove a condition from an actor.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {Teriock.ConditionKey} condition - The condition to roll for.
 * @param {Teriock.ConditionRollOptions} options
 * @returns {Promise<void>}
 * @private
 */
export async function _rollCondition(actorData, condition, options) {
  const actor = actorData.parent;
  let skip = options?.skip || false;
  const increaseDie = options?.increaseDie || false;
  const decreaseDie = options?.decreaseDie || false;
  let conditionName = "Condition";
  if (condition) {
    conditionName = CONFIG.TERIOCK.content.conditions[condition].name;
  }
  let numberOfDice = 2;
  if (increaseDie) {
    numberOfDice += 1;
  }
  if (decreaseDie) {
    numberOfDice -= 1;
  }
  let remove = false;
  let rollFormula = `${numberOfDice}d4kh`;
  if (!skip) {
    const dialog = new DialogV2({
      window: {
        title: `Remove ${conditionName}`,
      },
      content: `<label>Number of d4s</label><input type="number" name="formula" value="${numberOfDice}" />`,
      buttons: [
        {
          action: "roll",
          label: "Roll",
          default: true,
          callback: (event, button) => {
            numberOfDice = button.form.elements.formula.valueAsNumber;
            rollFormula = `${numberOfDice}d4kh`;
          },
        },
        {
          action: "remove",
          label: "Remove",
          default: false,
        },
      ],
      submit: async (result) => {
        if (result === "remove") {
          skip = true;
          remove = true;
        }
        if (!skip) {
          const rollData = actor.getRollData();
          const roll = new TeriockRoll(rollFormula, rollData, {
            context: {
              diceClass: "condition",
              threshold: 4,
            },
          });
          await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: `${conditionName} Ending Roll`,
          });
          const total = roll.total;
          if (total === 4) {
            remove = true;
          }
        }
        if (remove) {
          await actor.toggleStatusEffect(condition, { active: false });
        }
      },
    });
    await dialog.render(true);
  } else {
    await actor.toggleStatusEffect(condition, { active: false });
  }
}
