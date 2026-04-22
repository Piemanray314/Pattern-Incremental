import { PRESTIGE_CAST_SHARD } from "./castShardUpgrades.js";
import { PRESTIGE_CAST } from "./castUpgrades.js";

export const CASTING_TREE_GROUPS = [
  {
    id: "casts",
    label: "Casts",
    stateKey: "castingUpgrades",
    viewStateKey: "castingTreeView_casts",
    definitions: PRESTIGE_CAST,
    visibleWhen: (state) => (state.stats.totalCasts ?? 0) > 0
  },
  {
    id: "shards",
    label: "Shards",
    stateKey: "castingUpgrades",
    viewStateKey: "castingTreeView_shards",
    definitions: PRESTIGE_CAST_SHARD,
    visibleWhen: (state) => (state.stats.totalCasts ?? 0) > 0
  }
];