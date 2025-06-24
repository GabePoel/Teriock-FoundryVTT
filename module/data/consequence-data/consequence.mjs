export default class Consequence {
  constructor() {
    this.instant = {
      rolls: {},
      hacks: {},
    };
    this.ongoing = {
      statuses: [],
      changes: [],
    };
    this.duration = null;
    this.expirations = {
      turn: {
        enabled: false,
        who: "target",
        when: "start",
        how: "roll",
      },
    };
  }
}
