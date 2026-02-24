import type { User } from "@/types/user";
import { differenceInYears } from "date-fns";
import { getPlural } from "@/utils/plural";

export default function MeasurementsBoard({ user }: { user: User }) {
  const age = differenceInYears(new Date(), new Date(user.birthday));
  const agePlural = getPlural("age", age);

  const Item = ({
    title,
    value,
    unit,
  }: {
    title: string;
    value: string | number;
    unit: string;
  }) => {
    return (
      <div className="flex flex-col items-center justify-center bg-[#EEF2F5] py-2.5 rounded-xl">
        <h3 className="text-lg leading-[1.1] font-semibold">
          {value} {unit}
        </h3>
        <p className="text-base leading-[1.15]">{title}</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 bg-white px-3 py-4 rounded-2xl shadow-sm mb-2.5">
      <Item title="Вес" value={user.measurements?.[0]?.weight || 0} unit="кг" />
      <Item
        title="Рост"
        value={user.measurements?.[0]?.height || 0}
        unit="см"
      />
      <Item title="Возраст" value={age} unit={agePlural} />
    </div>
  );
}
