// The hero demo's example: $10,000 growing at 7% a year for 30 years.
const PRINCIPAL = 10_000;
const RATE = 0.07;

export const valueAfter = (years: number) => Math.round(PRINCIPAL * (1 + RATE) ** years);

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// "$10K", "$19.7K": one decimal, dropped when it's zero.
const usdCompact = {
  format: (value: number) => `$${Number((value / 1000).toFixed(1))}K`,
};

export const START_VALUE = valueAfter(0); // $10,000
export const END_VALUE = valueAfter(30); // $76,123

export const DECADES = [0, 10, 20, 30].map((year) => ({
  label: `Year ${year}`,
  value: valueAfter(year),
  display: usdCompact.format(valueAfter(year)),
}));

export const MILESTONES = [10, 20, 30].map((year) => ({
  label: `Year ${year}`,
  value: `${Number((valueAfter(year) / PRINCIPAL).toFixed(1))}×`,
  caption: usd.format(valueAfter(year)),
}));
