export function bmi(weight, height) {
  if (!weight || !height) return null;
  return +(weight / Math.pow(height / 100, 2)).toFixed(1);
}

export function bmiCategory(value) {
  if (value == null) return { label: "—", tone: "neutral" };
  if (value < 18.5) return { label: "کم‌وزن", tone: "warn" };
  if (value < 20.5) return { label: "کم‌وزن مرزی", tone: "warn" };
  if (value < 25) return { label: "طبیعی", tone: "ok" };
  if (value < 30) return { label: "اضافه‌وزن", tone: "warn" };
  if (value < 35) return { label: "چاقی درجه ۱", tone: "danger" };
  if (value < 40) return { label: "چاقی درجه ۲", tone: "danger" };
  return { label: "چاقی درجه ۳", tone: "danger" };
}

export function idealWeight(height) {
  if (!height) return null;
  return +(22 * Math.pow(height / 100, 2)).toFixed(1);
}

export function adjustedWeight(weight, height) {
  const ibw = idealWeight(height);
  const b = bmi(weight, height);
  if (ibw == null) return weight;
  if (b != null && b > 30) return +(ibw + 0.25 * (weight - ibw)).toFixed(1);
  return weight;
}

export function getWeightLossPercent({ weight, usual_weight, weight_loss_kg, weight_loss_percent }) {
  const currentWeight = Number(weight);
  const usualWeight = Number(usual_weight);
  const lossAmount = Number(weight_loss_kg);

  if (Number.isFinite(currentWeight) && currentWeight > 0) {
    const hasLossAmount = weight_loss_kg != null && Number.isFinite(lossAmount) && lossAmount >= 0;
    const loss = hasLossAmount
      ? lossAmount
      : Number.isFinite(usualWeight) && usualWeight > currentWeight
        ? usualWeight - currentWeight
        : null;
    const baseline = Number.isFinite(usualWeight) && usualWeight > 0 ? usualWeight : loss == null ? null : currentWeight + loss;
    if (loss != null && baseline > 0) return +((loss / baseline) * 100).toFixed(1);
  }

  const legacyPercent = Number(weight_loss_percent);
  return Number.isFinite(legacyPercent) && legacyPercent >= 0 ? legacyPercent : 0;
}

const INTAKE_POINTS = { none: 0, mild: 1, moderate: 2, severe: 3 };

export function computeNrs({ bmiValue, weightLossPercent, intakeReduction, diseaseSeverity, age }) {
  let nutrition = 0;
  if (intakeReduction === "severe" || (weightLossPercent || 0) >= 15) nutrition = 3;
  else if (bmiValue != null && bmiValue < 18.5) nutrition = 3;
  else if (intakeReduction === "moderate" || (weightLossPercent || 0) >= 5) nutrition = 2;
  else if (bmiValue != null && bmiValue < 20.5) nutrition = 2;
  else nutrition = INTAKE_POINTS[intakeReduction] || 0;

  const severity = Number(diseaseSeverity) || 0;
  const agePoint = Number(age) >= 70 ? 1 : 0;
  const total = nutrition + severity + agePoint;

  let level = "بدون خطر";
  let tone = "ok";
  if (total >= 5) {
    level = "پرخطر";
    tone = "danger";
  } else if (total >= 3) {
    level = "در معرض خطر";
    tone = "warn";
  }
  return { nutrition, severity, agePoint, total, level, tone };
}

export function computeTargets({ weight, height, protocol, fever, drain }) {
  const b = bmi(weight, height);
  const ibw = idealWeight(height);
  const energyWeight = adjustedWeight(weight, height);
  const stress = Number(protocol?.stress_factor) || 25;
  const proteinPerKg = Number(protocol?.protein_per_kg) || 1.0;
  const fluidPerKg = Number(protocol?.fluid_per_kg) || 30;
  const cap = Number(protocol?.fluid_cap) || 3000;

  const calorie = Math.round((stress * energyWeight) / 10) * 10;
  const protein = Math.round(proteinPerKg * energyWeight);
  let fluid = Math.round((fluidPerKg * energyWeight + (fever ? 500 : 0) + (drain ? 300 : 0)) / 50) * 50;
  fluid = Math.min(fluid, cap);

  return { bmiValue: b, ibw, energyWeight, calorie, protein, fluid };
}

export function gavagePlan({ kcalTarget, proteinTarget, formula, hours = 20, feeds = 4 }) {
  const kcalPerMl = Number(formula?.kcal_per_ml) || 1;
  const proteinPer100 = Number(formula?.protein_per_100ml) || 0;
  const volume = kcalTarget ? Math.round((kcalTarget / kcalPerMl) / 10) * 10 : 0;
  const proteinProvided = +((volume / 100) * proteinPer100).toFixed(1);
  const proteinGap = +(proteinTarget - proteinProvided).toFixed(1);
  const rate = hours > 0 ? +(volume / hours).toFixed(1) : 0;
  const perFeed = feeds > 0 ? Math.round(volume / feeds) : 0;
  const interval = feeds > 0 ? +(24 / feeds).toFixed(0) : 0;
  const freeWater = Math.max(0, Math.round((1 - kcalPerMl * 0.76) * volume * 0.5));
  return { volume, proteinProvided, proteinGap, rate, perFeed, interval, freeWater };
}

export function fmt(n, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}
