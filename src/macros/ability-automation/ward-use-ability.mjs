const isAttack = !!scope?.execution?.isAttack;
const thisArmament = !!(scope?.execution?.armament?.uuid === scope?.item?.uuid);
if (isAttack && thisArmament) {
  scope.effect?.delete();
}
