const { fields } = foundry.data;

export function attributeField() {
  return new fields.SchemaField({
    saveProficient: new fields.BooleanField({ initial: false }),
    saveFluent: new fields.BooleanField({ initial: false }),
    value: new fields.NumberField({ initial: -3 }),
  });
}

export function tradecraftField() {
  return new fields.SchemaField({
    proficient: new fields.BooleanField({ initial: false }),
    extra: new fields.NumberField({ initial: 0 }),
    bonus: new fields.NumberField({ initial: 0 }),
  })
}

export function hackField(max) {
  return new fields.SchemaField({
    min: new fields.NumberField({ initial: 0 }),
    max: new fields.NumberField({ initial: max }),
    value: new fields.NumberField({ initial: 0 }),
  })
}

export function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    size: new fields.StringField({ initial: size }),
    gapless: new fields.BooleanField({ initial: gapless }),
  })
}

export function sheetField() {
  return new fields.SchemaField({
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
      basic: new fields.BooleanField({ initial: false }),
      standard: new fields.BooleanField({ initial: false }),
      skill: new fields.BooleanField({ initial: false }),
      spell: new fields.BooleanField({ initial: false }),
      ritual: new fields.BooleanField({ initial: false }),
      rotator: new fields.BooleanField({ initial: false }),
      verbal: new fields.BooleanField({ initial: false }),
      somatic: new fields.BooleanField({ initial: false }),
      material: new fields.BooleanField({ initial: false }),
      invoked: new fields.BooleanField({ initial: false }),
      sustained: new fields.BooleanField({ initial: false }),
      broken: new fields.BooleanField({ initial: false }),
      hp: new fields.BooleanField({ initial: false }),
      mp: new fields.BooleanField({ initial: false }),
      heightened: new fields.BooleanField({ initial: false }),
      expansion: new fields.BooleanField({ initial: false }),
      maneuver: new fields.StringField({ initial: null, nullable: true }),
      interaction: new fields.StringField({ initial: null, nullable: true }),
      powerSource: new fields.StringField({ initial: null, nullable: true }),
      element: new fields.StringField({ initial: null, nullable: true }),
      effects: new fields.ArrayField(new fields.StringField()),
    }),
    equipmentFilters: new fields.SchemaField({
      search: new fields.StringField({ initial: "" }),
      equipped: new fields.BooleanField({ initial: false }),
      shattered: new fields.BooleanField({ initial: false }),
      consumable: new fields.BooleanField({ initial: false }),
      identified: new fields.BooleanField({ initial: false }),
      properties: new fields.StringField({ initial: "" }),
      materialProperties: new fields.StringField({ initial: "" }),
      magicalProperties: new fields.StringField({ initial: "" }),
      weaponFightingStyles: new fields.StringField({ initial: "" }),
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
}