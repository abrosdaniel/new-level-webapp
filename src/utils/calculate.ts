import { differenceInYears } from "date-fns";

/** Норма БЖУ в граммах */
export interface MacrosResult {
  protein: number;
  carbs: number;
  fat: number;
}

export interface CaloriesResult {
  weight_loss?: number;
  weight_maintenance?: number;
  gaining_muscle_mass?: number;
  /** Значение калорий для переданного goal (при наличии goal) */
  kcal?: number;
  /** Норма БЖУ для переданного goal (при наличии goal) */
  macros?: MacrosResult;
}

export interface UseCaloriesParams {
  gender: "male" | "female";
  birthday: Date | string;
  weight: number; // кг
  height: number; // см
  lifestyle: "low" | "easy" | "average" | "high" | "highst";
  goal?: "weight_loss" | "weight_maintenance" | "gaining_muscle_mass" | null;
}

/** Белок г/кг по цели (эталон: поддержание 1.5, похудение 1.6, набор 1.8) */
const PROTEIN_PER_KG_BASE: Record<
  "weight_loss" | "weight_maintenance" | "gaining_muscle_mass",
  number
> = {
  weight_loss: 1.6,
  weight_maintenance: 1.5,
  gaining_muscle_mass: 1.8,
};

/** Множитель белка по уровню активности */
const PROTEIN_LIFESTYLE_MULT: Record<
  "low" | "easy" | "average" | "high" | "highst",
  number
> = {
  low: 1,
  easy: 1.25,
  average: 1.5,
  high: 2,
  highst: 2.5,
};

/** Жиры г/кг по цели (эталон: 0.8–1 г/кг, среднее 0.9 для поддержания) */
const FAT_PER_KG: Record<
  "weight_loss" | "weight_maintenance" | "gaining_muscle_mass",
  number
> = {
  weight_loss: 0.8,
  weight_maintenance: 0.9,
  gaining_muscle_mass: 1,
};

/** Расчёт БЖУ: белок и жиры по весу, углеводы — остаток */
function calcMacros(
  kcal: number,
  weight: number,
  goal: "weight_loss" | "weight_maintenance" | "gaining_muscle_mass",
  lifestyle: "low" | "easy" | "average" | "high" | "highst",
): MacrosResult {
  const baseProtein = weight * PROTEIN_PER_KG_BASE[goal];
  const protein = baseProtein * PROTEIN_LIFESTYLE_MULT[lifestyle];
  const fat = weight * FAT_PER_KG[goal];
  const carbsKcal = kcal - protein * 4 - fat * 9;
  const carbs = Math.max(0, carbsKcal / 4);
  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}

/**
 * Расчёт калорий по формуле Миффлина-Сан Жеора.
 * При переданном goal возвращает только значение для этой цели в поле value.
 * @param params - Персональные данные и цель (goal)
 * @returns Объект с расчётами; value содержит результат для переданного goal
 */
export function getCalcCalories(params: UseCaloriesParams): CaloriesResult {
  const { gender, birthday, weight, height, lifestyle, goal } = params;

  const zeroMacros: MacrosResult = { protein: 0, carbs: 0, fat: 0 };
  const zeroResult: CaloriesResult = {
    weight_loss: 0,
    weight_maintenance: 0,
    gaining_muscle_mass: 0,
    kcal: 0,
    macros: zeroMacros,
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
    return {
      weight_loss: weightLoss,
      kcal: weightLoss,
      macros: calcMacros(weightLoss, weight, "weight_loss", lifestyle),
    };
  }
  if (goal === "weight_maintenance") {
    return {
      weight_maintenance: weightMaintenance,
      kcal: weightMaintenance,
      macros: calcMacros(
        weightMaintenance,
        weight,
        "weight_maintenance",
        lifestyle,
      ),
    };
  }
  if (goal === "gaining_muscle_mass") {
    return {
      gaining_muscle_mass: gainingMuscleMass,
      kcal: gainingMuscleMass,
      macros: calcMacros(
        gainingMuscleMass,
        weight,
        "gaining_muscle_mass",
        lifestyle,
      ),
    };
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
