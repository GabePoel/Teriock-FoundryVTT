const flankingButton = scope.execution.buttons.find(
  (b) => b.dataset.action === "apply-effect",
);
if (flankingButton) {
  const snareButton = foundry.utils.deepClone(flankingButton);
  const flankingSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "flanking",
  );
  const snareSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "snare",
  );
  if (flankingSub) {
    const children = JSON.stringify([flankingSub.uuid]);
    flankingButton.dataset.normalChildren = children;
    flankingButton.dataset.critChildren = children;
    flankingButton.label = game.i18n.format(
      "TERIOCK.COMMANDS.Status.applyNamed",
      { name: flankingSub.name },
    );
  }
  if (snareSub) {
    const children = JSON.stringify([snareSub.uuid]);
    snareButton.dataset.normalChildren = children;
    snareButton.dataset.critChildren = children;
    snareButton.label = game.i18n.format("TERIOCK.COMMANDS.Status.applyNamed", {
      name: snareSub.name,
    });
  }
  scope.execution.buttons.push(snareButton);
}
