export function getPlural(
  type: "age" | "month" | "day" | "kg" | "cm" | "ruble",
  value: number
) {
  const words = {
    age: ["год", "года", "лет"],
    month: ["месяц", "месяца", "месяцев"],
    day: ["день", "дня", "дней"],
    kg: ["килограмм", "килограмма", "килограммов"],
    cm: ["сантиметр", "сантиметра", "сантиметров"],
    ruble: ["рубль", "рубля", "рублей"],
  };
  const cases = {
    age: [2, 0, 1, 1, 1, 2],
    month: [2, 0, 1, 1, 1, 2],
    day: [2, 0, 1, 1, 1, 2],
    kg: [2, 0, 1, 1, 1, 2],
    cm: [2, 0, 1, 1, 1, 2],
    ruble: [2, 0, 1, 1, 1, 2],
  };
  return words[type][
    value % 100 > 4 && value % 100 < 20
      ? 2
      : cases[type][Math.min(value % 10, 5)]
  ];
}
