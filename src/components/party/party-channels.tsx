import type { DiscussionChannel } from "@/lib/db/schema";
import { channelTypeLabels, isSafeChannelUrl } from "@/lib/validations/channel";

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
        {channels.map((channel) => {
          // Defense-in-depth against rows that may have been stored before
          // the schema-level scheme allowlist was introduced. Render the URL
          // as plain text rather than an active <a href> when not safe.
          const safe = isSafeChannelUrl(channel.url);
          return (
            <div key={channel.id} className="border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                {channelTypeLabels[channel.type as keyof typeof channelTypeLabels] || "Canal"}
              </p>
              <p className="font-medium text-neighbor-stone">{channel.name}</p>
              {safe ? (
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-neighbor-orange break-all"
                >
                  {channel.url}
                </a>
              ) : (
                <span className="text-sm text-gray-500 break-all">
                  {channel.url}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
