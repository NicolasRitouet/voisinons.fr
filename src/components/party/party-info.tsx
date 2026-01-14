import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Party } from "@/lib/db/schema";

interface PartyInfoProps {
  party: Party;
}

export function PartyInfo({ party }: PartyInfoProps) {
  const dateStart = new Date(party.dateStart);
  const dateEnd = party.dateEnd ? new Date(party.dateEnd) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
        Informations pratiques
      </h2>

      <div className="space-y-4 font-[family-name:var(--font-outfit)]">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">&#128197;</span>
          <div>
            <div className="font-medium text-neighbor-stone">Date</div>
            <div className="text-gray-600 capitalize">
              {format(dateStart, "EEEE d MMMM yyyy", { locale: fr })}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">&#128337;</span>
          <div>
            <div className="font-medium text-neighbor-stone">Horaire</div>
            <div className="text-gray-600">
              {format(dateStart, "HH:mm", { locale: fr })}
              {dateEnd && ` - ${format(dateEnd, "HH:mm", { locale: fr })}`}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">&#128205;</span>
          <div>
            <div className="font-medium text-neighbor-stone">Lieu</div>
            <div className="text-gray-600">{party.address}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">&#128100;</span>
          <div>
            <div className="font-medium text-neighbor-stone">Organisateur</div>
            <div className="text-gray-600">{party.organizerName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
