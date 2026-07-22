import { Injectable } from '@angular/core';

export interface IncentiveTier {
  minAmount: number;
  /** How to compute incentive once this tier matches. */
  rewardType: 'rate' | 'fixed';
  /**
   * User-friendly rate value. Enter 20 for 0.20%, 30 for 0.30%.
   * Incentive = disbursed × (ratePercent / 10000).
   */
  ratePercent: number;
  /** Used when rewardType = fixed. Flat ₹ amount (e.g. for ≥ 1 lakh give this amount). */
  fixedAmount: number;
}

export interface IncentiveCalcConfig {
  pattern: 'tiered' | 'flat';
  /** Always true: apply formula on each month bucket then sum. */
  applyPerMonthBucket: boolean;
  tiers: IncentiveTier[];
  flatRatePercent: number;
}

@Injectable({
  providedIn: 'root',
})
export class IncentivePolicyService {
  readonly defaults: IncentiveCalcConfig = {
    pattern: 'tiered',
    applyPerMonthBucket: true,
    tiers: [
      {
        minAmount: 10000000,
        rewardType: 'rate',
        ratePercent: 30, // 0.30%
        fixedAmount: 0,
      },
      {
        minAmount: 4900000,
        rewardType: 'rate',
        ratePercent: 20, // 0.20%
        fixedAmount: 0,
      },
      {
        minAmount: 1500000,
        rewardType: 'rate',
        ratePercent: 15, // 0.15%
        fixedAmount: 0,
      },
    ],
    flatRatePercent: 20, // 0.20%
  };

  normalize(raw: any): IncentiveCalcConfig {
    let parsed = raw;
    if (typeof raw === 'string' && raw.trim()) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    if (!parsed || typeof parsed !== 'object') {
      return this.cloneDefaults();
    }

    const pattern = parsed.pattern === 'flat' ? 'flat' : 'tiered';
    const flatRate = this.toUserRate(Number(parsed.flatRatePercent));
    const tiers = this.normalizeTiers(parsed.tiers);

    return {
      pattern,
      // Always calculate First / Second / Third month separately, then sum.
      applyPerMonthBucket: true,
      tiers: tiers.length ? tiers : this.cloneDefaults().tiers,
      flatRatePercent:
        Number.isFinite(flatRate) && flatRate >= 0
          ? flatRate
          : this.defaults.flatRatePercent,
    };
  }

  normalizeFromSettings(settings: any): IncentiveCalcConfig {
    return this.normalize(settings?.incentiveCalcConfig);
  }

  calculateIncentiveAmount(
    monthTotals: number[],
    config?: IncentiveCalcConfig,
  ): number {
    const cfg = config || this.cloneDefaults();
    const totals = (monthTotals || []).map((n) =>
      Number.isFinite(Number(n)) ? Number(n) : 0,
    );

    // Always: each month bucket separately, then sum.
    return totals.reduce(
      (sum, total) => sum + this.calculateForAmount(total, cfg),
      0,
    );
  }

  calculateForAmount(
    totalDisbursedAmount: number,
    config: IncentiveCalcConfig,
  ): number {
    const amount = Number(totalDisbursedAmount) || 0;
    if (amount <= 0) {
      return 0;
    }

    if (config.pattern === 'flat') {
      return Math.round(this.applyRate(amount, config.flatRatePercent));
    }

    const tiers = [...(config.tiers || [])].sort(
      (a, b) => Number(b.minAmount) - Number(a.minAmount),
    );
    for (const tier of tiers) {
      if (amount >= Number(tier.minAmount)) {
        if (tier.rewardType === 'fixed') {
          return Math.round(Number(tier.fixedAmount) || 0);
        }
        return Math.round(this.applyRate(amount, tier.ratePercent));
      }
    }
    return 0;
  }

  toStorageJson(config: IncentiveCalcConfig): string {
    return JSON.stringify(this.normalize(config));
  }

  createEmptyTier(): IncentiveTier {
    return {
      minAmount: 0,
      rewardType: 'rate',
      ratePercent: 0,
      fixedAmount: 0,
    };
  }

  /**
   * User enters 20 → means 0.20% → amount × 0.002.
   * Old saved values like 0.20 are migrated to 20.
   */
  private applyRate(amount: number, userRate: number): number {
    const rate = this.toUserRate(Number(userRate) || 0);
    // 20 → 0.20% of amount = amount * 20 / 10000
    return amount * (rate / 10000);
  }

  /** Convert old decimal rates (0.20) to user values (20). */
  private toUserRate(value: number): number {
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }
    // Old format stored 0.15 / 0.2 / 0.3 — migrate to 15 / 20 / 30
    if (value > 0 && value < 1) {
      return Number((value * 100).toFixed(4));
    }
    return value;
  }

  private normalizeTiers(tiers: any): IncentiveTier[] {
    if (!Array.isArray(tiers)) {
      return [];
    }
    return tiers
      .map((tier) => {
        const rewardType =
          tier?.rewardType === 'fixed' ||
          (tier?.rewardType !== 'rate' &&
            Number(tier?.fixedAmount) > 0 &&
            !(Number(tier?.ratePercent) > 0))
            ? 'fixed'
            : 'rate';
        return {
          minAmount: Number(tier?.minAmount),
          rewardType: rewardType as 'rate' | 'fixed',
          ratePercent: this.toUserRate(Number(tier?.ratePercent) || 0),
          fixedAmount: Number(tier?.fixedAmount) || 0,
        };
      })
      .filter((tier) => {
        if (!Number.isFinite(tier.minAmount) || tier.minAmount < 0) {
          return false;
        }
        if (tier.rewardType === 'fixed') {
          return Number.isFinite(tier.fixedAmount) && tier.fixedAmount >= 0;
        }
        return Number.isFinite(tier.ratePercent) && tier.ratePercent >= 0;
      })
      .sort((a, b) => b.minAmount - a.minAmount);
  }

  private cloneDefaults(): IncentiveCalcConfig {
    return {
      pattern: this.defaults.pattern,
      applyPerMonthBucket: true,
      flatRatePercent: this.defaults.flatRatePercent,
      tiers: this.defaults.tiers.map((t) => ({ ...t })),
    };
  }
}
