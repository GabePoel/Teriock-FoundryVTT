import { inCombatExpirationDialog } from "../../../applications/dialogs/_module.mjs";
import { getRollIcon, makeIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import { HierarchyDataMixin } from "../../mixins/_module.mjs";
import { fieldBuilders } from "../../shared/fields/helpers/_module.mjs";
import { migrateHierarchy } from "../../shared/migrations/migrate-hierarchy.mjs";
import TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

const { fields } = foundry.data;

/**
 * Effect-specific effect data model.
 * @extends TeriockBaseEffectModel
 * @mixes HierarchyDataMixin
 */
export default class TeriockConsequenceModel extends HierarchyDataMixin(
  TeriockBaseEffectModel,
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    type: "consequence",
    usable: true,
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      associations: fieldBuilders.associationsField(),
      blocks: fieldBuilders.blocksField(),
      critical: new fields.BooleanField({ initial: false }),
      source: new fields.StringField({
        initial: "",
        nullable: true,
      }),
      expirations: new fields.SchemaField({
        conditions: new fields.SchemaField({
          present: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.conditions,
            }),
            {
              label: "Present Conditions",
              hint: "What conditions must be present in order for this ability to be active?",
            },
          ),
          absent: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.conditions,
            }),
            {
              label: "Absent Conditions",
              hint: "What conditions must be absent in order for this ability to be active?",
            },
          ),
        }),
        movement: new fields.BooleanField({
          initial: false,
          label: "Stationary Expiration",
          hint: "If true, effect expires on movement.",
        }),
        dawn: new fields.BooleanField({
          initial: false,
          label: "Dawn Expiration",
          hint: "If true, effect expires at dawn.",
        }),
        sustained: new fields.BooleanField({
          initial: false,
          label: "Sustained Expiration",
          hint: "If true, effect expires if its source is deleted or disabled.",
        }),
        description: new fields.StringField({
          label: "End Condition",
          hint: "Under what circumstances should this effect expire?",
        }),
        combat: new fields.SchemaField({
          who: new fields.SchemaField({
            type: fieldBuilders.combatExpirationSourceTypeField(),
            source: new fields.DocumentUUIDField({
              type: "Actor",
              nullable: true,
              label: "Actor",
              hint: "UUID of actor whose turn or other information is used to trigger an expiration?",
            }),
          }),
          what: fieldBuilders.combatExpirationMethodField(),
          when: fieldBuilders.combatExpirationTimingField(),
        }),
      }),
      sourceDescription: new fields.HTMLField(),
      heightened: new fields.NumberField(),
      transformation: fieldBuilders.transformationField(true),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrateHierarchy(data);
    return data;
  }

  /**
   * Checks if the effect has condition-based expiration.
   * @returns {boolean} True if the effect expires based on a condition, false otherwise.
   */
  get conditionExpiration() {
    return (
      this.expirations.conditions.present.size +
        this.expirations.conditions.absent.size >
      0
    );
  }

  /**
   * Checks if the effect expires at dawn.
   * @returns {boolean} True if the effect expires at dawn, false otherwise.
   */
  get dawnExpiration() {
    return this.expirations.dawn;
  }

  /**
   * Gets the maneuver type for this effect.
   * Effects are always passive maneuvers.
   * @returns {string} The maneuver type ("passive").
   */
  get maneuver() {
    return "passive";
  }

  /**
   * Whether this consequence is a transformation.
   * @returns {boolean}
   */
  get isTransformation() {
    return this.transformation.enabled;
  }

  /**
   * Whether this is the primary transformation.
   * @returns {boolean}
   */
  get isPrimaryTransformation() {
    if (this.actor) {
      return (
        this.isTransformation &&
        this.actor.system.transformation.primary === this.parent.id
      );
    } else {
      return this.isTransformation;
    }
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /**
   * Checks if the effect expires on movement.
   * @returns {boolean} True if the effect expires on movement, false otherwise.
   */
  get movementExpiration() {
    return this.expirations.movement;
  }

  /** @inheritDoc */
  get nameString() {
    let ns = super.nameString;
    if (this.critical) {
      ns += " (Critical)";
    }
    return ns;
  }

  /** @inheritDoc */
  get shouldExpire() {
    let should = super.shouldExpire;
    if (this.conditionExpiration && this.actor) {
      const conditions = this.actor.statuses;
      for (const condition of this.expirations.conditions.present) {
        should = should || !conditions.has(condition);
      }
      for (const condition of this.expirations.conditions.absent) {
        should = should || conditions.has(condition);
      }
    }
    if (this.sustainedExpiration) {
      /** @type {TeriockEffect} */
      const source = foundry.utils.fromUuidSync(this.source);
      should = should || !source || source.disabled;
    }
    return should;
  }

  /**
   * Checks if the effect expires when its source is deleted or disabled.
   * @returns {boolean} True if the effect expires when sustained, false otherwise.
   */
  get sustainedExpiration() {
    return this.expirations.sustained;
  }

  /** @inheritDoc */
  get useIcon() {
    return getRollIcon(this.expirations.combat.what.roll);
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`;
  }

  /**
   * Trigger in-combat expiration.
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (this.isTransformation && this.parent.actor) {
      this.parent.updateSource({
        flags: {
          teriock: {
            wasTransformed: this.parent.actor.system.isTransformed,
            preTransformHp: this.parent.actor.system.hp.value,
            preTransformMp: this.parent.actor.system.mp.value,
            priorTransform: this.parent.actor.system.transformation.primary,
          },
        },
      });
      const uuids = this.transformation.uuids;
      let species = /** @type {TeriockSpecies[]} */ await Promise.all(
        uuids.map((uuid) => foundry.utils.fromUuid(uuid)),
      );
      species = species.filter((s) => s);
      if (species) {
        const speciesData = /** @type {TeriockSpecies[]} */ species.map((s) =>
          s.toObject(),
        );
        speciesData.forEach((s) => {
          s.system.transformationLevel = this.transformation.level;
          if (s.system.size.min && s.system.size.max) {
            s.system.size.value = Math.min(
              s.system.size.max,
              Math.max(
                s.system.size.min,
                this.parent.actor.system.size.number.value,
              ),
            );
          }
        });
        const created =
          /** @type {TeriockSpecies[]} */ await this.parent.actor.createEmbeddedDocuments(
            "Item",
            speciesData,
          );
        for (const species of created) {
          await species.system.importDeterministic();
        }
        this.parent.updateSource({
          "system.transformation.species": created.map((s) => s.id),
        });
      }
    }
  }

  /**
   * Set this is the primary transformation.
   * @returns {Promise<void>}
   */
  async setPrimaryTransformation() {
    if (this.parent.actor && this.isTransformation) {
      await this.parent.actor.update({
        "system.transformation.primary": this.parent.id,
      });
    }
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Set Primary Transformation",
        icon: makeIcon("tree", "contextMenu"),
        callback: this.setPrimaryTransformation.bind(this),
        condition: this.isTransformation && !this.isPrimaryTransformation,
        group: "usage",
      },
    ];
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (game.user.id !== userId) {
      return;
    }
    if (!this.isTransformation || !this.parent.actor) {
      return;
    }
    const actor = this.parent.actor;
    const updateData = {
      "system.transformation.primary": this.parent.id,
    };
    // This high number is included because just setting to `system.hp.max` or `system.mp.max` uses the former
    // values. This requires explicit filtering when rendering numbers on the actor's tokens.
    if (this.transformation.resetHp) {
      updateData["system.hp.value"] = 99999999;
    }
    if (this.transformation.resetMp) {
      updateData["system.mp.value"] = 99999999;
    }
    actor
      .setFlag("teriock", "transformationApplied", this.parent.key)
      .then(() => actor.update(updateData));
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    if (this.isTransformation && this.parent.actor) {
      suppressed = suppressed || !this.isPrimaryTransformation;
    }
    return suppressed;
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    if ((await super._preDelete(options, user)) === false) {
      return false;
    }
    if (this.parent.actor) {
      const speciesIds = this.transformation.species.filter((id) =>
        this.parent.actor.species.map((s) => s.id).includes(id),
      );
      if (speciesIds.length > 0) {
        await this.parent.actor.deleteEmbeddedDocuments("Item", speciesIds);
      }
      if (this.isTransformation) {
        const updateData = {
          "system.transformation.primary": this.parent.getFlag(
            "teriock",
            "priorTransform",
          ),
        };
        if (this.transformation.resetHp) {
          updateData["system.hp.value"] = this.parent.getFlag(
            "teriock",
            "preTransformHp",
          );
        }
        if (this.transformation.resetMp) {
          updateData["system.mp.value"] = this.parent.getFlag(
            "teriock",
            "preTransformMp",
          );
        }
        await this.parent.actor.update(updateData);
      }
    }
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (this.isTransformation) {
      if (
        !this.transformation.image &&
        this.parent.actor &&
        this.transformation.species.length > 0
      ) {
        const firstSpecies = this.parent.actor.items.get(
          this.transformation.species[0],
        );
        if (firstSpecies) {
          this.transformation.image = firstSpecies.img;
        }
      }
    }
  }

  /** @inheritDoc */
  async roll(_options) {
    await this.inCombatExpiration(true);
  }
}
