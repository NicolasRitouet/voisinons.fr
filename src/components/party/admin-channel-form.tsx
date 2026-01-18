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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createChannelSchema,
  channelTypes,
  channelTypeLabels,
  type CreateChannelInput,
} from "@/lib/validations/channel";
import { createDiscussionChannel } from "@/lib/actions/party";

interface AdminChannelFormProps {
  partyId: string;
  token: string;
}

export function AdminChannelForm({ partyId, token }: AdminChannelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      partyId,
      token,
      type: "whatsapp",
      name: "",
      url: "",
    },
  });

  async function onSubmit(data: CreateChannelInput) {
    setFormError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await createDiscussionChannel(data);

      if (result.success) {
        setSuccessMessage("Canal ajouté.");
        form.reset({
          partyId,
          token,
          type: "whatsapp",
          name: "",
          url: "",
        });
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
            form.setError(key as keyof CreateChannelInput, {
              message: messages[0],
            });
          }
        });
      } else {
        setFormError("Une erreur inattendue est survenue");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...form.register("partyId")} />
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
                  <Input placeholder="ex: Groupe WhatsApp de la fête" {...field} />
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
                  <Input placeholder="https://" {...field} />
                </FormControl>
                <FormDescription>
                  Collez le lien d'invitation (WhatsApp, Signal, etc.).
                </FormDescription>
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="bg-neighbor-orange hover:bg-neighbor-orange/90"
            disabled={isPending}
          >
            {isPending ? "Ajout..." : "Publier le canal"}
          </Button>
          {successMessage && (
            <span className="text-sm text-green-700">{successMessage}</span>
          )}
        </div>
      </form>
    </Form>
  );
}
