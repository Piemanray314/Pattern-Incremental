import { addBigNum, compareBigNum, divideBigNumByNumber, multiplyBigNum, multiplyBigNumByNumber, oneBigNum, powerBigNum, roundSmallToWholeMantissa, safeLog10BigNum, subtractBigNum, toBigNum, zeroBigNum } from "../../utils/bigNum.js";
import { getUpgradeLevel, hasUpgrade } from "./upgradeHelpers.js";

export const PIE_TIER_ORDER = [
  "piemen",
  "pieFactory",
  "piePlanet",
  "pieGalaxy",
  "pieUniverse",
  "pieDimension"
];

export const PIE_TIER_NAMES = {
  piemen: "Piemen",
  pieFactory: "Pie Factory",
  piePlanet: "Pie Planet",
  pieGalaxy: "Pie Galaxy",
  pieUniverse: "Pie Universe",
  pieDimension: "Pie Dimension"
};

const PIE_TIER_BASE_COSTS = {
  piemen: toBigNum(1),
  pieFactory: toBigNum(450),
  piePlanet: toBigNum({ mantissa: 1.25, exponent: 8 }),
  pieGalaxy: toBigNum({ mantissa: 2.75, exponent: 14 }),
  pieUniverse: toBigNum({ mantissa: 1, exponent: 26 }),
  pieDimension: toBigNum({ mantissa: 1, exponent: 42 })
};

const PIE_TIER_COST_GROWTH = {
  piemen: 2,
  pieFactory: 5,
  piePlanet: 17,
  pieGalaxy: 89,
  pieUniverse: 1282,
  pieDimension: 67676
};

const PIE_UNLOCK_UPGRADE_ID = "PRES00204";
const PASTRY_REVOLUTION_UPGRADE_ID = "PIES00000";
const INDUSTRIAL_OVEN_UPGRADE_ID = "PIES00200";
const ETERNAL_PIES_UPGRADE_ID = "PIES00201";
const ANCIENT_HARNESTING_UPGRADE_ID = "PIES00202";
const PASTRY_REVOLUTION_LEVEL_THRESHOLDS = [0, 40, 30, 20, 10];
const INDUSTRIAL_OVEN_LOG_POWERS = [2, 3, 4, 5, 6, 6];
export const PIE_FACTORY_FPS = 30;
const PIE_RUNTIME_STEP_MS = 1000 / PIE_FACTORY_FPS;
const REBAKE_DEFAULT_AFFECTED_TIERS = 1;

// Returns true if Pie Factory systems are unlocked
export function isPieFactoryUnlocked(state) {
  return hasUpgrade(state, PIE_UNLOCK_UPGRADE_ID, "castingUpgrades");
}

// Ensures Pie Factory state exists and has valid defaults
export function ensurePieFactoryState(state) {
  state.pieFactory ??= {};
  const pieFactory = state.pieFactory;

  pieFactory.tiers ??= {};

  for (const tierId of PIE_TIER_ORDER) {
    pieFactory.tiers[tierId] ??= {};
    const tier = pieFactory.tiers[tierId];

    const isPiemen = tierId === "piemen";
    const defaultCount = isPiemen ? oneBigNum() : zeroBigNum();
    const defaultLevel = isPiemen ? 1 : 0;

    tier.count = toBigNum(tier.count ?? defaultCount);
    tier.level = Math.max(0, Math.floor(Number(tier.level ?? defaultLevel)));
    tier.progressBuffer = Number.isFinite(tier.progressBuffer) ? Math.max(0, tier.progressBuffer) : 0;
    tier.purchases = Math.max(0, Math.floor(Number(tier.purchases ?? 0)));
  }

  pieFactory.castedPies = toBigNum(pieFactory.castedPies ?? zeroBigNum());
  pieFactory.investedCastedPiesLifetime = toBigNum(pieFactory.investedCastedPiesLifetime ?? zeroBigNum());
  pieFactory.globalProductionMultiplier = toBigNum(pieFactory.globalProductionMultiplier ?? oneBigNum());
  pieFactory.accumulatedPiesThisTierBoost = toBigNum(
    pieFactory.accumulatedPiesThisTierBoost ?? zeroBigNum()
  );
  pieFactory.rebakeTierMultiplier = toBigNum(pieFactory.rebakeTierMultiplier ?? oneBigNum());
  pieFactory.rebakeAffectedTierCount = Math.max(
    1,
    Math.floor(Number(pieFactory.rebakeAffectedTierCount ?? REBAKE_DEFAULT_AFFECTED_TIERS))
  );

  state.currencies ??= {};
  state.currencies.pies = toBigNum(state.currencies.pies ?? zeroBigNum());
}

// Returns data needed to render one tier row
export function getPieTierDisplayData(state, tierId) {
  ensurePieFactoryState(state);
  const tier = state.pieFactory.tiers[tierId];
  const nextLevelCost = getNextTierLevelCost(state, tierId);
  const isAffordable = compareBigNum(nextLevelCost, zeroBigNum()) <= 0 ||
    compareBigNum(state.currencies.pies ?? zeroBigNum(), nextLevelCost) >= 0;

  return {
    id: tierId,
    name: PIE_TIER_NAMES[tierId] ?? tierId,
    level: tier.level,
    count: toBigNum(tier.count),
    multiplier: getTierProductionMultiplier(state, tierId),
    producingPerSecond: getTierOutgoingPerSecond(state, tierId),
    producingTargetTierId: getTierOutputTargetTierId(tierId),
    countChangePercentPerSecond: getTierCountChangePercentPerSecond(state, tierId),
    nextLevelCost,
    isAffordable
  };
}

// Returns point multiplier from casted pies as log10(casted+1)+1
export function getCastedPiePointMultiplier(state) {
  ensurePieFactoryState(state);

  const casted = toBigNum(state.pieFactory.castedPies ?? zeroBigNum());
  return getCastedPiePointMultiplierFromCasted(casted);
}

// Runs pie production runtime for one tick
export function updatePieFactoryRuntime(state, deltaMs) {
  if (!isPieFactoryUnlocked(state)) return;

  ensurePieFactoryState(state);
  state.timers ??= {};
  state.timers.pieFactoryRuntimeAccumulatorMs =
    (state.timers.pieFactoryRuntimeAccumulatorMs ?? 0) + Math.max(0, deltaMs);

  let runtimeSteps = Math.floor(state.timers.pieFactoryRuntimeAccumulatorMs / PIE_RUNTIME_STEP_MS);
  if (runtimeSteps <= 0) return;

  state.timers.pieFactoryRuntimeAccumulatorMs -= runtimeSteps * PIE_RUNTIME_STEP_MS;
  const deltaSeconds = PIE_RUNTIME_STEP_MS / 1000;

  const globalMultiplier = toBigNum(state.pieFactory.globalProductionMultiplier ?? oneBigNum());
  const tiers = state.pieFactory.tiers;

  while (runtimeSteps > 0) {
    runtimeSteps -= 1;

    const outputs = {};
    for (const tierId of PIE_TIER_ORDER) {
      const tier = tiers[tierId];
      const rebakeMultiplier = getRebakeTierMultiplierForTier(state, tierId);
      const revolutionMultiplier = getPastryRevolutionTierMultiplier(state, tierId);
      const baseRate = multiplyBigNum(
        getTierEffectiveCount(state, tierId),
        toBigNum(Math.max(0, tier.level))
      );

      outputs[tierId] = multiplyBigNumByNumber(
        multiplyBigNum(
          multiplyBigNum(multiplyBigNum(baseRate, globalMultiplier), rebakeMultiplier),
          revolutionMultiplier
        ),
        deltaSeconds
      );
    }

    for (let index = 0; index < PIE_TIER_ORDER.length; index++) {
      const tierId = PIE_TIER_ORDER[index];
      const produced = outputs[tierId] ?? zeroBigNum();

      if (compareBigNum(produced, zeroBigNum()) <= 0) continue;

      if (index === 0) {
        state.currencies.pies = addBigNum(state.currencies.pies, produced);
        state.pieFactory.accumulatedPiesThisTierBoost = addBigNum(
          state.pieFactory.accumulatedPiesThisTierBoost ?? zeroBigNum(),
          produced
        );
        state.stats ??= {};
        state.stats.lifetimePies = addBigNum(
          toBigNum(state.stats.lifetimePies ?? zeroBigNum()),
          produced
        );
        continue;
      }

      const lowerTierId = PIE_TIER_ORDER[index - 1];
      addTierCountFromProduction(state, lowerTierId, produced);
    }
  }
}

// Buys exactly one level for a tier
export function buyPieTierOne(state, tierId) {
  ensurePieFactoryState(state);

  const tier = getTierState(state, tierId);
  if (!tier) return false;

  const cost = getNextTierLevelCost(state, tierId);
  if (compareBigNum(cost, zeroBigNum()) > 0 && compareBigNum(state.currencies.pies, cost) < 0) {
    return false;
  }

  if (compareBigNum(cost, zeroBigNum()) > 0) {
    state.currencies.pies = subtractBigNum(state.currencies.pies, cost);
  }

  applyTierLevelPurchase(tier);
  return true;
}

// Buys as many levels as possible for a tier, returning levels bought
export function buyPieTierMax(state, tierId) {
  ensurePieFactoryState(state);

  const tier = getTierState(state, tierId);
  if (!tier) return 0;

  let totalBought = 0;

  const firstCost = getNextTierLevelCost(state, tierId);
  if (compareBigNum(firstCost, zeroBigNum()) <= 0) {
    return totalBought;
  }

  if (compareBigNum(state.currencies.pies, firstCost) < 0) {
    return totalBought;
  }

  let low = 0;
  let high = 1;

  while (high < 1_000_000) {
    const cost = getTotalTierCostForNextLevels(state, tierId, high);
    if (compareBigNum(cost, state.currencies.pies) > 0) break;

    low = high;
    high *= 2;
  }

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    const cost = getTotalTierCostForNextLevels(state, tierId, mid);

    if (compareBigNum(cost, state.currencies.pies) <= 0) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  const levelsToBuy = low;
  if (levelsToBuy <= 0) return totalBought;

  const totalCost = getTotalTierCostForNextLevels(state, tierId, levelsToBuy);
  state.currencies.pies = subtractBigNum(state.currencies.pies, totalCost);

  tier.level += levelsToBuy;
  tier.purchases += levelsToBuy;
  if (compareBigNum(tier.count, zeroBigNum()) <= 0) {
    tier.count = oneBigNum();
  }

  totalBought += levelsToBuy;
  return totalBought;
}

// Converts current pies into casted pies using sqrt and resets pie run tiers
export function sacrificePies(state) {
  ensurePieFactoryState(state);

  const currentPies = toBigNum(state.currencies.pies ?? zeroBigNum());
  const gained = powerBigNum(currentPies, 0.5);

  state.pieFactory.castedPies = addBigNum(state.pieFactory.castedPies, gained);
  state.stats ??= {};
  state.stats.lifetimeTotalCastedPies = addBigNum(
    toBigNum(state.stats.lifetimeTotalCastedPies ?? zeroBigNum()),
    gained
  );
  resetPieRunState(state);

  return gained;
}

// Invests all casted pies into permanent global tier production multiplier
export function investCastedPies(state) {
  ensurePieFactoryState(state);

  const casted = toBigNum(state.pieFactory.castedPies ?? zeroBigNum());
  state.pieFactory.investedCastedPiesLifetime = addBigNum(
    state.pieFactory.investedCastedPiesLifetime,
    casted
  );

  state.pieFactory.castedPies = zeroBigNum();

  state.pieFactory.globalProductionMultiplier = getTierBoostMultiplierFromInvested(
    state,
    state.pieFactory.investedCastedPiesLifetime
  );
  state.pieFactory.accumulatedPiesThisTierBoost = zeroBigNum();
  state.pieFactory.rebakeTierMultiplier = oneBigNum();

  return state.pieFactory.globalProductionMultiplier;
}

// Resets pies and sets unlocked tier owned counts to 1, then updates rebake tier multiplier from accumulated pies
export function rebakePies(state) {
  ensurePieFactoryState(state);

  const accumulated = toBigNum(state.pieFactory.accumulatedPiesThisTierBoost ?? zeroBigNum());
  const projectedMultiplier = getRebakeTierMultiplier(state, accumulated);
  const keepPies = hasUpgrade(state, ETERNAL_PIES_UPGRADE_ID, "pieUpgrades");
  if (!keepPies) {
    state.currencies.pies = zeroBigNum();
  }

  for (const tierId of PIE_TIER_ORDER) {
    const tier = state.pieFactory.tiers[tierId];
    if (!tier) continue;

    if (isTierUnlockedForRebake(tier)) {
      tier.count = oneBigNum();
      tier.progressBuffer = 0;
      continue;
    }

    tier.count = zeroBigNum();
    tier.progressBuffer = 0;
  }

  state.pieFactory.rebakeTierMultiplier = projectedMultiplier;

  return projectedMultiplier;
}

// Returns current and projected rebake tier multiplier data
export function getRebakeEffectData(state) {
  ensurePieFactoryState(state);

  const accumulated = toBigNum(state.pieFactory.accumulatedPiesThisTierBoost ?? zeroBigNum());
  const currentMultiplier = toBigNum(state.pieFactory.rebakeTierMultiplier ?? oneBigNum());
  const projectedMultiplier = getRebakeTierMultiplier(state, accumulated);

  return {
    accumulatedPiesThisTierBoost: roundSmallToWholeMantissa(accumulated),
    currentMultiplier,
    projectedMultiplier
  };
}

// Returns the cost to buy the next level of a tier
export function getNextTierLevelCost(state, tierId) {
  ensurePieFactoryState(state);

  const tier = getTierState(state, tierId);
  if (!tier) return zeroBigNum();

  const baseCost = toBigNum(PIE_TIER_BASE_COSTS[tierId] ?? oneBigNum());
  const growth = PIE_TIER_COST_GROWTH[tierId] ?? 1;

  const effectiveIndex = getTierEffectivePurchaseIndex(tierId, tier.purchases);
  const multiplier = powerBigNum(toBigNum(growth), effectiveIndex);
  return multiplyBigNum(baseCost, multiplier);
}

// Returns geometric total cost for buying the next N levels
export function getTotalTierCostForNextLevels(state, tierId, levelsToBuy) {
  if (levelsToBuy <= 0) return zeroBigNum();

  const firstCost = getNextTierLevelCost(state, tierId);
  if (compareBigNum(firstCost, zeroBigNum()) <= 0) {
    return zeroBigNum();
  }

  const growth = PIE_TIER_COST_GROWTH[tierId] ?? 1;
  if (growth <= 1 || levelsToBuy === 1) {
    return multiplyBigNumByNumber(firstCost, levelsToBuy);
  }

  const growthPow = powerBigNum(toBigNum(growth), levelsToBuy);
  const numerator = subtractBigNum(growthPow, oneBigNum());
  const geometricFactor = divideBigNumByNumber(numerator, growth - 1);

  return multiplyBigNum(firstCost, geometricFactor);
}

// Returns the per-tier production multiplier used in UI
export function getTierProductionMultiplier(state, tierId) {
  ensurePieFactoryState(state);

  const tier = getTierState(state, tierId);
  if (!tier) return oneBigNum();

  return multiplyBigNum(
    multiplyBigNum(
      toBigNum(Math.max(0, tier.level)),
      toBigNum(state.pieFactory.globalProductionMultiplier ?? oneBigNum())
    ),
    multiplyBigNum(
      getRebakeTierMultiplierForTier(state, tierId),
      getPastryRevolutionTierMultiplier(state, tierId)
    )
  );
}

// Returns outgoing production/sec for a tier
export function getTierOutgoingPerSecond(state, tierId) {
  ensurePieFactoryState(state);

  const tier = getTierState(state, tierId);
  if (!tier) return zeroBigNum();

  const globalMultiplier = toBigNum(state.pieFactory.globalProductionMultiplier ?? oneBigNum());
  const rebakeMultiplier = getRebakeTierMultiplierForTier(state, tierId);
  const revolutionMultiplier = getPastryRevolutionTierMultiplier(state, tierId);
  return multiplyBigNum(
    multiplyBigNum(
      multiplyBigNum(getTierEffectiveCount(state, tierId), toBigNum(Math.max(0, tier.level))),
      globalMultiplier
    ),
    multiplyBigNum(rebakeMultiplier, revolutionMultiplier)
  );
}

// Returns incoming production/sec for a tier from the next tier above
export function getTierIncomingPerSecond(state, tierId) {
  ensurePieFactoryState(state);

  const tierIndex = PIE_TIER_ORDER.indexOf(tierId);
  if (tierIndex < 0 || tierIndex >= PIE_TIER_ORDER.length - 1) {
    return zeroBigNum();
  }

  const producerTierId = PIE_TIER_ORDER[tierIndex + 1];
  return getTierOutgoingPerSecond(state, producerTierId);
}

// Returns count growth percent/sec for a tier relative to current count
export function getTierCountChangePercentPerSecond(state, tierId) {
  ensurePieFactoryState(state);

  const tier = getTierState(state, tierId);
  if (!tier) return 0;

  const currentCount = toBigNum(tier.count ?? zeroBigNum());
  const incomingPerSecond = getTierIncomingPerSecond(state, tierId);

  if (compareBigNum(currentCount, zeroBigNum()) <= 0) {
    return compareBigNum(incomingPerSecond, zeroBigNum()) > 0 ? Number.POSITIVE_INFINITY : 0;
  }

  if (compareBigNum(incomingPerSecond, zeroBigNum()) <= 0) return 0;

  const logRatio =
    safeLog10BigNum(incomingPerSecond) - safeLog10BigNum(currentCount);
  const ratio = Math.pow(10, logRatio);

  if (!Number.isFinite(ratio)) return Number.POSITIVE_INFINITY;
  return ratio * 100;
}

// Returns a short effect text for sacrifice card
export function getSacrificeEffectText(state) {
  return getSacrificeEffectData(state).gainedCastedPies;
}

// Returns a short effect text for investment card
export function getInvestmentEffectText(state) {
  ensurePieFactoryState(state);

  return getInvestmentEffectData(state).projectedMultiplier;
}

// Returns current and projected investment multiplier data
export function getInvestmentEffectData(state) {
  ensurePieFactoryState(state);

  const casted = toBigNum(state.pieFactory.castedPies ?? zeroBigNum());
  const currentMultiplier = toBigNum(state.pieFactory.globalProductionMultiplier ?? oneBigNum());
  const projectedInvested = addBigNum(state.pieFactory.investedCastedPiesLifetime, casted);
  const projectedMultiplier = getTierBoostMultiplierFromInvested(state, projectedInvested);

  return {
    currentMultiplier,
    projectedMultiplier
  };
}

// Returns current and projected casted-pie point multiplier from sacrifice
export function getSacrificeEffectData(state) {
  ensurePieFactoryState(state);

  const gainedCastedPies = powerBigNum(toBigNum(state.currencies.pies ?? zeroBigNum()), 0.5);
  const currentCastedPies = toBigNum(state.pieFactory.castedPies ?? zeroBigNum());
  const projectedCastedPies = addBigNum(currentCastedPies, gainedCastedPies);

  return {
    gainedCastedPies,
    currentPointMultiplier: getCastedPiePointMultiplierFromCasted(currentCastedPies),
    projectedPointMultiplier: getCastedPiePointMultiplierFromCasted(projectedCastedPies)
  };
}

// Resets current pie-run state and keeps long-term pie progression
export function resetPieRunState(state) {
  ensurePieFactoryState(state);

  state.currencies.pies = zeroBigNum();

  for (const tierId of PIE_TIER_ORDER) {
    const tier = state.pieFactory.tiers[tierId];
    const isPiemen = tierId === "piemen";

    tier.count = isPiemen ? oneBigNum() : zeroBigNum();
    tier.level = isPiemen ? 1 : 0;
    tier.progressBuffer = 0;
    tier.purchases = 0;
  }
}

function getTierState(state, tierId) {
  return state.pieFactory?.tiers?.[tierId] ?? null;
}

// Pies will have a multiplier of (log(pies + 1) + 1)^(3/5) on rolls
function getCastedPiePointMultiplierFromCasted(castedPies) {
  const castedPlusOne = addBigNum(toBigNum(castedPies), oneBigNum());
  const logTerm = toBigNum(Math.max(1, safeLog10BigNum(castedPlusOne) + 1));
  const threeFifthsRootTerm = powerBigNum(castedPlusOne, 0.6);
  return multiplyBigNum(logTerm, threeFifthsRootTerm);
}

function getTierEffectiveCount(state, tierId) {
  const tier = getTierState(state, tierId);
  if (!tier) return zeroBigNum();

  const wholeCount = toBigNum(tier.count ?? zeroBigNum());
  const fractionalCount = toBigNum(tier.progressBuffer ?? 0);
  return addBigNum(wholeCount, fractionalCount);
}

function getTierOutputTargetTierId(tierId) {
  const tierIndex = PIE_TIER_ORDER.indexOf(tierId);
  if (tierIndex < 0) return null;
  if (tierIndex === 0) return "pies";
  return PIE_TIER_ORDER[tierIndex - 1];
}

function getTierEffectivePurchaseIndex(tierId, purchases) {
  return Math.max(0, purchases);
}

function isTierUnlockedForRebake(tier) {
  if (!tier) return false;
  if ((tier.level ?? 0) > 0) return true;
  if ((tier.purchases ?? 0) > 0) return true;
  return compareBigNum(tier.count ?? zeroBigNum(), zeroBigNum()) > 0;
}

function getRebakeTierMultiplier(state, accumulatedPies) {
  const accumulatedPlusOne = addBigNum(toBigNum(accumulatedPies), oneBigNum());
  const logTerm = safeLog10BigNum(accumulatedPlusOne);
  const industrialOvenLevel = getUpgradeLevel(state, INDUSTRIAL_OVEN_UPGRADE_ID, "pieUpgrades");
  const logPower = getIndustrialOvenLogPower(industrialOvenLevel);
  const logPowered = Math.pow(Math.max(0, logTerm), logPower);
  return toBigNum(Math.max(1, logPowered));
}

function getRebakeTierMultiplierForTier(state, tierId) {
  const tierIndex = PIE_TIER_ORDER.indexOf(tierId);
  if (tierIndex < 0) return oneBigNum();

  const affectedTierCount = Math.max(
    1,
    Math.floor(Number(state.pieFactory?.rebakeAffectedTierCount ?? REBAKE_DEFAULT_AFFECTED_TIERS))
  );

  if (tierIndex >= affectedTierCount) return oneBigNum();
  return toBigNum(state.pieFactory?.rebakeTierMultiplier ?? oneBigNum());
}

function getPastryRevolutionTierMultiplier(state, tierId) {
  const tier = getTierState(state, tierId);
  if (!tier) return oneBigNum();

  const upgradeLevel = getUpgradeLevel(state, PASTRY_REVOLUTION_UPGRADE_ID, "pieUpgrades");
  const threshold = getPastryRevolutionLevelsPerUpgrade(upgradeLevel);

  if (!threshold || threshold <= 0) return oneBigNum();

  const tierLevel = Math.max(0, Math.floor(Number(tier.level ?? 0)));
  const upgrades = Math.floor(tierLevel / threshold);
  if (upgrades <= 0) return oneBigNum();

  return powerBigNum(toBigNum(10), upgrades);
}

function getTierBoostMultiplierFromInvested(state, investedCastedPiesLifetime) {
  const investedPlusOne = addBigNum(toBigNum(investedCastedPiesLifetime), oneBigNum());
  const baseMultiplier = Math.max(1, safeLog10BigNum(investedPlusOne) + 1);
  return multiplyBigNum(
    toBigNum(baseMultiplier),
    getAncientHarnestingTierBoostMultiplier(state)
  );
}

function getAncientHarnestingTierBoostMultiplier(state) {
  const level = Math.max(0, getUpgradeLevel(state, ANCIENT_HARNESTING_UPGRADE_ID, "pieUpgrades"));
  return getAncientHarnestingTierBoostMultiplierFromLevel(level);
}

export function getPastryRevolutionLevelsPerUpgrade(level) {
  const safeLevel = Math.max(0, Math.floor(Number(level ?? 0)));
  const clamped = Math.min(safeLevel, PASTRY_REVOLUTION_LEVEL_THRESHOLDS.length - 1);
  return PASTRY_REVOLUTION_LEVEL_THRESHOLDS[clamped] ?? 0;
}

export function getIndustrialOvenLogPower(level) {
  const safeLevel = Math.max(0, Math.floor(Number(level ?? 0)));
  const clamped = Math.min(safeLevel, INDUSTRIAL_OVEN_LOG_POWERS.length - 1);
  return INDUSTRIAL_OVEN_LOG_POWERS[clamped] ?? 2;
}

export function getAncientHarnestingTierBoostMultiplierFromLevel(level) {
  const safeLevel = Math.max(0, Math.floor(Number(level ?? 0)));
  return toBigNum(Math.pow(1.2, safeLevel));
}

function applyTierLevelPurchase(tier) {
  tier.level += 1;
  tier.purchases += 1;

  if (compareBigNum(tier.count, zeroBigNum()) <= 0) {
    tier.count = oneBigNum();
  }
}

function addTierCountFromProduction(state, tierId, produced) {
  const tier = getTierState(state, tierId);
  if (!tier) return;

  const output = toBigNum(produced);
  if (output.mantissa === 0) return;

  if (output.exponent > 12) {
    tier.count = addBigNum(tier.count, output);
    tier.progressBuffer = 0;
    return;
  }

  const producedAsNumber = output.mantissa * Math.pow(10, output.exponent);
  if (!Number.isFinite(producedAsNumber) || producedAsNumber <= 0) return;

  const total = producedAsNumber + (tier.progressBuffer ?? 0);
  const whole = Math.floor(total);
  const fractional = Math.max(0, total - whole);

  if (whole > 0) {
    tier.count = addBigNum(tier.count, toBigNum(whole));
  }

  tier.progressBuffer = fractional;
}
