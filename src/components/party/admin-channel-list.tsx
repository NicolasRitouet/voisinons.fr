"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  channelTypes,
  channelTypeLabels,
  updateChannelSchema,
  type UpdateChannelInput,
} from "@/lib/validations/channel";
import {
  deleteDiscussionChannel,
  updateDiscussionChannel,
} from "@/lib/actions/party";
import type { DiscussionChannel } from "@/lib/db/schema";

interface AdminChannelListProps {
  channels: DiscussionChannel[];
  token: string;
}

interface AdminChannelItemProps {
  channel: DiscussionChannel;
  token: string;
}

function AdminChannelItem({ channel, token }: AdminChannelItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdateChannelInput>({
    resolver: zodResolver(updateChannelSchema),
    defaultValues: {
      channelId: channel.id,
      token,
      type: channel.type as UpdateChannelInput["type"],
      name: channel.name,
      url: channel.url,
    },
  });

  async function onSubmit(data: UpdateChannelInput) {
    setFormError(null);

    startTransition(async () => {
      const result = await updateDiscussionChannel(data);

      if (result.success) {
        setIsEditing(false);
        router.refresh();
        return;
      }

      if (result.error) {
        if ("_form" in result.error) {
          const formErrors = result.error._form as string[];
          setFormError(formErrors?.[0] || "Une erreur est survenue");
        }
        Object.entries(result.error).forEach(([key, messages]) => {
          if (key !== "_form" && messages && messages.length > 0) {
            form.setError(key as keyof UpdateChannelInput, {
              message: messages[0],
            });
          }
        });
      } else {
        setFormError("Une erreur inattendue est survenue");
      }
    });
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce canal ?")) return;

    startTransition(async () => {
      const result = await deleteDiscussionChannel({
        channelId: channel.id,
        token,
      });

      if (result.success) {
        router.refresh();
        return;
      }

      setFormError("Impossible de supprimer le canal");
    });
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 rounded-lg p-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">
            {channelTypeLabels[channel.type as keyof typeof channelTypeLabels] || "Canal"}
          </p>
          <p className="text-neighbor-stone font-medium">{channel.name}</p>
          <p className="text-xs text-gray-500 break-all">{channel.url}</p>
          {formError && (
            <p className="text-xs text-red-600 mt-2">{formError}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditing(true);
              setFormError(null);
            }}
          >
            Modifier
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isPending}
          >
            Supprimer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("channelId")} />
          <input type="hidden" {...form.register("token")} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {channelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {channelTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du groupe</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {formError}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormError(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-neighbor-orange hover:bg-neighbor-orange/90"
              disabled={isPending}
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function AdminChannelList({ channels, token }: AdminChannelListProps) {
  if (!channels.length) {
    return <p className="text-gray-500">Aucun canal publié pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      {channels.map((channel) => (
        <AdminChannelItem key={channel.id} channel={channel} token={token} />
      ))}
    </div>
  );
}
