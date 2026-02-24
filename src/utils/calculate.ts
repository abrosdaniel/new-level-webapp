import { differenceInYears } from "date-fns";

export interface CaloriesResult {
  weight_loss?: number;
  weight_maintenance?: number;
  gaining_muscle_mass?: number;
  /** Значение для переданного goal (при наличии goal) */
  value?: number;
}

export interface UseCaloriesParams {
  gender: "male" | "female";
  birthday: Date | string;
  weight: number; // кг
  height: number; // см
  lifestyle: "low" | "easy" | "average" | "high" | "highst";
  goal?: "weight_loss" | "weight_maintenance" | "gaining_muscle_mass" | null;
}

/**
 * Расчёт калорий по формуле Миффлина-Сан Жеора.
 * При переданном goal возвращает только значение для этой цели в поле value.
 * @param params - Персональные данные и цель (goal)
 * @returns Объект с расчётами; value содержит результат для переданного goal
 */
export function getCalcCalories(params: UseCaloriesParams): CaloriesResult {
  const { gender, birthday, weight, height, lifestyle, goal } = params;

  const zeroResult: CaloriesResult = {
    weight_loss: 0,
    weight_maintenance: 0,
    gaining_muscle_mass: 0,
    value: 0,
  };

  if (weight === 0 || height === 0) {
    return zeroResult;
  }

  const birthdayDate =
    typeof birthday === "string" ? new Date(birthday) : birthday;

  if (Number.isNaN(birthdayDate.getTime())) {
    return zeroResult;
  }

  const age = differenceInYears(new Date(), birthdayDate);

  const activityMultipliers: Record<
    "low" | "easy" | "average" | "high" | "highst",
    number
  > = {
    low: 1.2,
    easy: 1.375,
    average: 1.55,
    high: 1.725,
    highst: 1.9,
  };

  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = bmr * activityMultipliers[lifestyle];

  const weightLoss = Math.round(tdee - tdee * 0.1);
  const weightMaintenance = Math.round(tdee);
  const gainingMuscleMass = Math.round(tdee * 1.1);

  if (goal === "weight_loss") {
    return { weight_loss: weightLoss, value: weightLoss };
  }
  if (goal === "weight_maintenance") {
    return { weight_maintenance: weightMaintenance, value: weightMaintenance };
  }
  if (goal === "gaining_muscle_mass") {
    return { gaining_muscle_mass: gainingMuscleMass, value: gainingMuscleMass };
  }

  return {
    weight_loss: weightLoss,
    weight_maintenance: weightMaintenance,
    gaining_muscle_mass: gainingMuscleMass,
  };
}

export function getCalcRecipe(
  portion_weight: number,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
): {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return {
    kcal: Math.round((kcal * portion_weight) / 100),
    protein: Math.round((protein * portion_weight) / 100),
    carbs: Math.round((carbs * portion_weight) / 100),
    fat: Math.round((fat * portion_weight) / 100),
  };
}
