import type { DiscussionChannel } from "@/lib/db/schema";
import { channelTypeLabels } from "@/lib/validations/channel";

interface PartyChannelsProps {
  channels: DiscussionChannel[];
}

export function PartyChannels({ channels }: PartyChannelsProps) {
  if (!channels || channels.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-xl text-neighbor-stone mb-4">
        Canal de communication
      </h2>
      <div className="space-y-3">
        {channels.map((channel) => (
          <div key={channel.id} className="border border-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              {channelTypeLabels[channel.type as keyof typeof channelTypeLabels] || "Canal"}
            </p>
            <p className="font-medium text-neighbor-stone">{channel.name}</p>
            <a
              href={channel.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neighbor-orange break-all"
            >
              {channel.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
