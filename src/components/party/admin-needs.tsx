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
import { createNeedCategory, deleteNeedCategory } from "@/lib/actions/need";
import { createNeedSchema, type CreateNeedInput } from "@/lib/validations/need";
import type { Need } from "@/lib/db/schema";
import {
  defaultNeedCategories,
  mergeNeedsWithDefaults,
  needCategoryIcons,
  needCategoryLabels,
  getNeedLabel,
} from "@/lib/needs";

interface AdminNeedsProps {
  partyId: string;
  token: string;
  needs: Need[];
}

const availableCategories = defaultNeedCategories
  .map((item) => item.category)
  .filter((category) => category !== "autre");

export function AdminNeeds({ partyId, token, needs }: AdminNeedsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateNeedInput>({
    resolver: zodResolver(createNeedSchema),
    defaultValues: {
      partyId,
      token,
      category: "autre",
      description: "",
    },
  });

  const selectedCategory = form.watch("category");

  async function onSubmit(data: CreateNeedInput) {
    setFormError(null);

    startTransition(async () => {
      const result = await createNeedCategory(data);

      if (result.success) {
        form.reset({
          partyId,
          token,
          category: "autre",
          description: "",
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
            form.setError(key as keyof CreateNeedInput, {
              message: messages[0],
            });
          }
        });
      } else {
        setFormError("Une erreur inattendue est survenue");
      }
    });
  }

  async function handleDelete(needId: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;

    startTransition(async () => {
      const result = await deleteNeedCategory({ needId, token });
      if (result.success) {
        router.refresh();
      } else {
        setFormError("Impossible de supprimer la catégorie");
      }
    });
  }

  const mergedNeeds = mergeNeedsWithDefaults(needs);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("partyId")} />
          <input type="hidden" {...form.register("token")} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== "autre") {
                        form.setValue("description", needCategoryLabels[value as keyof typeof needCategoryLabels]);
                      } else {
                        form.setValue("description", "");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {needCategoryIcons[category]} {needCategoryLabels[category]}
                        </SelectItem>
                      ))}
                      <SelectItem value="autre">📦 Autre (personnalisé)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom affiché</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={selectedCategory !== "autre"}
                      placeholder="ex: Décorations, Musique..."
                    />
                  </FormControl>
                  <FormDescription>
                    Pour "Autre", vous pouvez personnaliser le nom.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button
                type="submit"
                className="bg-neighbor-orange hover:bg-neighbor-orange/90"
                disabled={isPending}
              >
                {isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {formError}
            </div>
          )}
        </form>
      </Form>

      <div className="space-y-3">
        {mergedNeeds.map((need) => (
          <div
            key={need.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {needCategoryIcons[need.category as keyof typeof needCategoryIcons]}
              </span>
              <div>
                <p className="text-neighbor-stone font-medium">{getNeedLabel(need)}</p>
                {need.isDefault && (
                  <p className="text-xs text-gray-500">Catégorie par défaut</p>
                )}
              </div>
            </div>
            {need.isDefault ? (
              <Button type="button" variant="outline" disabled>
                Par défaut
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => handleDelete(need.id)}>
                Supprimer
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
