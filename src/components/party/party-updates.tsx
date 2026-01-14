import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PartyUpdate } from "@/lib/db/schema";

interface PartyUpdatesProps {
  updates: PartyUpdate[];
}

export function PartyUpdates({ updates }: PartyUpdatesProps) {
  if (updates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
        Nouvelles des organisateurs
      </h2>
      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="border-l-2 border-neighbor-orange pl-4 py-2"
          >
            <p className="font-[family-name:var(--font-outfit)] text-gray-700 whitespace-pre-wrap">
              {update.content}
            </p>
            <p className="text-xs text-gray-400 mt-2 font-[family-name:var(--font-outfit)]">
              {format(new Date(update.createdAt), "d MMMM yyyy 'à' HH:mm", {
                locale: fr,
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
