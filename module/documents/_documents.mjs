import TeriockActor from "./actor.mjs";
import TeriockEffect from "./effect.mjs";
import TeriockItem from "./item.mjs";

/**
 * Character-specific {@link TeriockActor} class.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @property {TeriockCharacterData} system
 * @property {TeriockCharacterSheet} sheet
 * @property {"actor"} type
 */
export class TeriockCharacter extends TeriockActor {}

/**
 * Equipment-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @property {TeriockEquipmentData} system
 * @property {TeriockEquipmentSheet} sheet
 * @property {"equipment"} type
 */
export class TeriockEquipment extends TeriockItem {}

/**
 * Power-specific {@link TeriockItem} class.
 *
 * @property {TeriockPowerData} system
 * @property {TeriockPowerSheet} sheet
 * @property {"power"} type
 */
export class TeriockPower extends TeriockItem {}

/**
 * Rank-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @property {TeriockRankData} system
 * @property {TeriockRankSheet} sheet
 * @property {"rank"} type
 */
export class TeriockRank extends TeriockItem {}

/**
 * Ability-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @property {TeriockAbilityData} system
 * @property {TeriockAbilitySheet} sheet
 * @property {"ability"} type
 */
export class TeriockAbility extends TeriockEffect {}

/**
 * Lingering {@link TeriockEffect} class.
 *
 * @property {TeriockEffectData} system
 * @property {"effect"} type
 */
export class TeriockLingeringEffect extends TeriockEffect {}

/**
 * Attunement-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 *
 * @property {TeriockAttunementData}
 * @property {"attunement"} type
 */
export class TeriockAttunement extends TeriockEffect {}

/**
 * Condition-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @property {TeriockConditionData} system
 * @property {"condition"} type
 */
export class TeriockCondition extends TeriockEffect {}

/**
 * Fluency-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @property {TeriockFluencyData} system
 * @property {TeriockFluencySheet} sheet
 * @property {"fluency"} type
 */
export class TeriockFluency extends TeriockEffect {}

/**
 * Property-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @property {TeriockPropertyData} system
 * @property {TeriockPropertySheet} sheet
 * @property {"property"} type
 */
export class TeriockProperty extends TeriockEffect {}

/**
 * Resource-specific {@link TeriockEffect} class.
 *
 * @property {TeriockResourceData} system
 * @property {TeriockResourceSheet} sheet
 * @property {"resource"} type
 */
export class TeriockResource extends TeriockEffect {}
