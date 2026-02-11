const { fields } = foundry.data;

/**
 * Actor data model that handles movement.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorMovementPartInterface}
     * @mixin
     */
    class ActorMovementPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          speedAdjustments: new fields.SchemaField({
            climb: speedField(1, "Climb"),
            crawl: speedField(1, "Crawl"),
            difficultTerrain: speedField(2, "Difficult Terrain"),
            dig: speedField(0, "Dig"),
            dive: speedField(0, "Dive"),
            fly: speedField(0, "Fly"),
            hidden: speedField(1, "Hidden"),
            leapHorizontal: speedField(1, "Horizontal Leap"),
            leapVertical: speedField(0, "Vertical Leap"),
            swim: speedField(1, "Swim"),
            walk: speedField(3, "Walk"),
          }),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        rollData["speed"] = this.movementSpeed;
        for (const [k, v] of Object.entries(SPEED_MAP)) {
          const adjustment = this.speedAdjustments[v] || 0;
          rollData[`speed.${k}`] = adjustment;
          let feetPerMove = 0;
          switch (adjustment) {
            case 0:
              feetPerMove = 0;
              break;
            case 1:
              feetPerMove = this.movementSpeed / 4;
              break;
            case 2:
              feetPerMove = this.movementSpeed / 2;
              break;
            case 3:
              feetPerMove = this.movementSpeed;
              break;
            case 4:
              feetPerMove = this.movementSpeed * 2;
              break;
          }
          rollData[`speed.${k}.feet`] = feetPerMove;
        }
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.movementSpeed = 30 + 10 * this.attributes.mov.score;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.movementSpeed = 30 + 10 * this.attributes.mov.score;
      }

      /** @inheritDoc */
      prepareVirtualEffects() {
        super.prepareVirtualEffects();
        for (const key of Object.keys(this.speedAdjustments)) {
          if (this.parent.statuses.has("slowed")) {
            this.speedAdjustments[key] -= 1;
          }
          if (this.parent.statuses.has("immobilized")) {
            this.speedAdjustments[key] = 0;
          }
          this.speedAdjustments[key] = Math.max(this.speedAdjustments[key], 0);
        }
      }
    }
  );
};

/**
 * Creates a speed adjustment field definition for different movement types.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 *
 * @param {number} initial - The initial speed adjustment value (0-4)
 * @param {string} name - The display name for this speed adjustment type
 */
function speedField(initial, name) {
  return new fields.NumberField({
    initial: initial,
    integer: true,
    label: `${name} Speed Adjustment`,
    max: 4,
    min: 0,
    step: 1,
  });
}

const SPEED_MAP = {
  cli: "climb",
  cra: "crawl",
  dif: "difficultTerrain",
  dig: "dig",
  div: "dive",
  fly: "fly",
  hid: "hidden",
  leh: "leapHorizontal",
  lev: "leapVertical",
  swi: "swim",
  wal: "walk",
};
