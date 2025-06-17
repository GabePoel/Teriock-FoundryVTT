const { fields } = foundry.data;

function speedField(initial, name) {
  return new fields.NumberField({
    initial: initial,
    integer: true,
    max: 4,
    min: 0,
    step: 1,
    label: `${name} Speed Adjustment`,
  })
}

export function _defineSpeed(schema) {
  schema.speedAdjustments = new fields.SchemaField({
    walk: speedField(3, "Walk"),
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
  })
  return schema;
}