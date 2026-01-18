import { getNeedIcon, getNeedLabel, type NeedLike } from "@/lib/needs";

interface PartyNeedsProps {
  needs: NeedLike[];
}

export function PartyNeeds({ needs }: PartyNeedsProps) {
  if (!needs || needs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
        Idées de choses à apporter
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {needs.map((need) => (
          <div key={need.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <span className="text-xl" aria-hidden>
              {getNeedIcon(need)}
            </span>
            <span className="text-sm font-medium text-neighbor-stone">
              {getNeedLabel(need)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
