import { useMemo } from "react";
import type { PublicParticipant } from "@/lib/actions/party";
import { Badge } from "@/components/ui/badge";

interface ParticipantsListProps {
  participants: PublicParticipant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  // Combine iterations: compute totalGuests and filter contributions in single pass
  const { totalGuests, participantsWithContributions } = useMemo(() => {
    let guests = 0;
    const withContributions: PublicParticipant[] = [];

    for (const p of participants) {
      guests += p.guestCount || 1;
      if (p.bringing) {
        withContributions.push(p);
      }
    }

    return { totalGuests: guests, participantsWithContributions: withContributions };
  }, [participants]);

  if (participants.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
          Participants
        </h2>
        <p className="font-[family-name:var(--font-outfit)] text-gray-500 text-sm">
          Soyez le premier à vous inscrire !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone">
            Participants
          </h2>
          <Badge variant="secondary" className="bg-neighbor-green/10 text-neighbor-green">
            {totalGuests} {totalGuests > 1 ? "personnes" : "personne"}
          </Badge>
        </div>

        <ul className="space-y-3">
          {participants.map((participant) => {
            const initial = participant.name.charAt(0).toUpperCase();
            const displayName = participant.name.split(" ")[0];
            const lastInitial = participant.name.split(" ")[1]?.charAt(0);
            const guestCount = participant.guestCount || 1;

            return (
              <li key={participant.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neighbor-orange/10 text-neighbor-orange flex items-center justify-center font-bold text-sm">
                  {initial}
                </div>
                <div className="font-[family-name:var(--font-outfit)] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-neighbor-stone">
                      {displayName}
                      {lastInitial && ` ${lastInitial}.`}
                    </span>
                    {participant.isOrganizer && (
                      <Badge className="bg-neighbor-stone text-white text-xs">
                        Organisateur
                      </Badge>
                    )}
                    {guestCount > 1 && (
                      <span className="text-xs text-gray-500">
                        +{guestCount - 1}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {participantsWithContributions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
            Ce qu&apos;on apporte
          </h2>
          <ul className="space-y-2">
            {participantsWithContributions.map((participant) => (
              <li
                key={participant.id}
                className="font-[family-name:var(--font-outfit)] text-sm"
              >
                <span className="font-medium text-neighbor-stone">
                  {participant.name.split(" ")[0]} :
                </span>{" "}
                <span className="text-gray-600">{participant.bringing}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
