"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimePicker, TimePicker } from "@/components/ui/datetime-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressAutocomplete, type AddressSuggestion } from "@/components/ui/address-autocomplete";
import { UploadButton } from "@/lib/uploadthing";
import {
  updatePartyDetailsSchema,
  type UpdatePartyDetailsInput,
} from "@/lib/validations/party";
import { updatePartyDetails } from "@/lib/actions/party";

interface AdminEditPartyFormProps {
  partyId: string;
  token: string;
  defaultDate: string;
  defaultTimeStart: string;
  defaultTimeEnd?: string | null;
  defaultAddress: string;
  defaultCoverImageUrl?: string | null;
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
}

export function AdminEditPartyForm({
  partyId,
  token,
  defaultDate,
  defaultTimeStart,
  defaultTimeEnd,
  defaultAddress,
  defaultCoverImageUrl,
  defaultLatitude,
  defaultLongitude,
}: AdminEditPartyFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const initialValues: UpdatePartyDetailsInput = {
    partyId,
    token,
    address: defaultAddress,
    coverImageUrl: defaultCoverImageUrl ?? "",
    date: defaultDate,
    timeStart: defaultTimeStart,
    timeEnd: defaultTimeEnd ?? "",
    latitude: defaultLatitude ?? undefined,
    longitude: defaultLongitude ?? undefined,
  };

  const form = useForm<UpdatePartyDetailsInput>({
    resolver: zodResolver(updatePartyDetailsSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const { isValid } = form.formState;

  async function onSubmit(data: UpdatePartyDetailsInput) {
    setFormError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updatePartyDetails(data);

      if (result.success) {
        setSuccessMessage("Modifications enregistrées.");
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
            form.setError(key as keyof UpdatePartyDetailsInput, {
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
    <div className="w-full space-y-3">
      {!isEditing && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsEditing(true);
            setSuccessMessage(null);
            setUploadError(null);
            form.reset(initialValues);
          }}
        >
          Modifier la fête
        </Button>
      )}

      {successMessage && (
        <span className="text-sm text-green-700">{successMessage}</span>
      )}

      {isEditing && (
        <Card className="bg-white border border-neighbor-orange/20">
          <CardContent className="p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <input type="hidden" {...form.register("partyId")} />
                <input type="hidden" {...form.register("token")} />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse *</FormLabel>
                  <FormControl>
                    <AddressAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      onSelect={(suggestion: AddressSuggestion) => {
                        form.setValue("latitude", suggestion.latitude);
                        form.setValue("longitude", suggestion.longitude);
                      }}
                      placeholder="Commencez à taper une adresse..."
                    />
                  </FormControl>
                  <FormDescription>
                    Choisissez une adresse dans la liste pour améliorer l'affichage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        field.onChange(date?.toISOString() ?? "");
                      }}
                      granularity="day"
                      locale={fr}
                      placeholder="Choisir une date"
                      displayFormat={{ hour24: "EEEE d MMMM yyyy" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeStart"
                render={({ field }) => {
                  const [hours, minutes] = (field.value || "14:00")
                    .split(":")
                    .map(Number);
                  const timeDate = new Date(2000, 0, 1, hours, minutes, 0, 0);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Heure de début *</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-2">
                          <TimePicker
                            date={timeDate}
                            onChange={(date) => {
                              if (date) {
                                const h = date.getHours().toString().padStart(2, "0");
                                const m = date.getMinutes().toString().padStart(2, "0");
                                field.onChange(`${h}:${m}`);
                              }
                            }}
                            granularity="minute"
                            hourCycle={24}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="timeEnd"
                render={({ field }) => {
                  const [hours, minutes] = (field.value || "21:00")
                    .split(":")
                    .map(Number);
                  const timeDate = new Date(2000, 0, 1, hours, minutes, 0, 0);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Heure de fin</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-2">
                          <TimePicker
                            date={timeDate}
                            onChange={(date) => {
                              if (date) {
                                const h = date.getHours().toString().padStart(2, "0");
                                const m = date.getMinutes().toString().padStart(2, "0");
                                field.onChange(`${h}:${m}`);
                              }
                            }}
                            granularity="minute"
                            hourCycle={24}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image d&apos;illustration (optionnel)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {field.value ? (
                        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={field.value}
                            alt="Aperçu de l'illustration"
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-md rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                          Aucune image sélectionnée
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <UploadButton
                          endpoint="partyCoverImage"
                          onClientUploadComplete={(res) => {
                            const url =
                              res?.[0]?.url || (res?.[0] as { ufsUrl?: string })?.ufsUrl;
                            if (url) {
                              field.onChange(url);
                              setUploadError(null);
                            }
                          }}
                          onUploadError={(error) => {
                            setUploadError(error.message);
                          }}
                          appearance={{
                            button:
                              "bg-neighbor-stone text-white hover:bg-neighbor-orange px-4 py-2 rounded-md",
                          }}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              field.onChange("");
                              setUploadError(null);
                            }}
                          >
                            Retirer l&apos;image
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Téléversez une image pour illustrer la fête.
                  </FormDescription>
                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {formError}
              </div>
            )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormError(null);
                    setUploadError(null);
                    form.reset(initialValues);
                  }}
                >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-neighbor-orange hover:bg-neighbor-orange/90"
                    disabled={isPending || !isValid}
                  >
                    {isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
