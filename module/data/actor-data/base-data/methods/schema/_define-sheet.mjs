const { fields } = foundry.data;

function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    size: new fields.StringField({ initial: size }),
    gapless: new fields.BooleanField({ initial: gapless }),
  })
}

export function _defineSheet(schema) {
  schema.sheet = new fields.SchemaField({
    activeTab: new fields.StringField({ initial: "abilities" }),
    menus: new fields.SchemaField({
      abilityFilters: new fields.BooleanField({ initial: false }),
      abilityOptions: new fields.BooleanField({ initial: false }),
      abilitySort: new fields.BooleanField({ initial: false }),
      equipmentFilters: new fields.BooleanField({ initial: false }),
      equipmentOptions: new fields.BooleanField({ initial: false }),
      equipmentSort: new fields.BooleanField({ initial: false }),
      fluencyOptions: new fields.BooleanField({ initial: false }),
      resourceOptions: new fields.BooleanField({ initial: false }),
      rankOptions: new fields.BooleanField({ initial: false }),
      powerOptions: new fields.BooleanField({ initial: false }),
      effectOptions: new fields.BooleanField({ initial: false }),
    }),
    abilityFilters: new fields.SchemaField({
      search: new fields.StringField({ initial: "" }),
      basic: new fields.NumberField({ initial: 0 }),
      standard: new fields.NumberField({ initial: 0 }),
      skill: new fields.NumberField({ initial: 0 }),
      spell: new fields.NumberField({ initial: 0 }),
      ritual: new fields.NumberField({ initial: 0 }),
      rotator: new fields.NumberField({ initial: 0 }),
      verbal: new fields.NumberField({ initial: 0 }),
      somatic: new fields.NumberField({ initial: 0 }),
      material: new fields.NumberField({ initial: 0 }),
      invoked: new fields.NumberField({ initial: 0 }),
      sustained: new fields.NumberField({ initial: 0 }),
      broken: new fields.NumberField({ initial: 0 }),
      hp: new fields.NumberField({ initial: 0 }),
      mp: new fields.NumberField({ initial: 0 }),
      heightened: new fields.NumberField({ initial: 0 }),
      expansion: new fields.NumberField({ initial: 0 }),
      maneuver: new fields.StringField({ initial: null, nullable: true }),
      interaction: new fields.StringField({ initial: null, nullable: true }),
      powerSource: new fields.StringField({ initial: null, nullable: true }),
      element: new fields.StringField({ initial: null, nullable: true }),
      effects: new fields.ArrayField(new fields.StringField()),
    }),
    equipmentFilters: new fields.SchemaField({
      search: new fields.StringField({ initial: "" }),
      equipped: new fields.NumberField({ initial: 0 }),
      shattered: new fields.NumberField({ initial: 0 }),
      consumable: new fields.NumberField({ initial: 0 }),
      identified: new fields.NumberField({ initial: 0 }),
      properties: new fields.StringField({ initial: "" }),
      materialProperties: new fields.StringField({ initial: "" }),
      magicalProperties: new fields.StringField({ initial: "" }),
      weaponFightingStyles: new fields.StringField({ initial: "" }),
      equipmentClasses: new fields.StringField({ initial: "" }),
      powerLevel: new fields.StringField({ initial: "" }),
    }),
    abilitySortOption: new fields.StringField({ initial: "name" }),
    abilitySortAscending: new fields.BooleanField({ initial: true }),
    equipmentSortOption: new fields.StringField({ initial: "name" }),
    equipmentSortAscending: new fields.BooleanField({ initial: true }),
    display: new fields.SchemaField({
      ability: displayField("small", true),
      fluency: displayField(),
      rank: displayField(),
      equipment: displayField("small", true),
      power: displayField(),
      resource: displayField(),
      condition: displayField(),
      effect: displayField(),
    }),
    notes: new fields.HTMLField({ initial: "Notes can be added here." }),
    dieBox: new fields.HTMLField({ initial: "" }),
    primaryBlocker: new fields.StringField({ initial: null, nullable: true }),
    primaryAttacker: new fields.StringField({ initial: null, nullable: true }),
  });
  return schema;
}