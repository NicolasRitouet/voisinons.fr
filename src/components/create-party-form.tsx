"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent } from "@/components/ui/card";
import { AddressAutocomplete, type AddressSuggestion } from "@/components/ui/address-autocomplete";

import {
  createPartySchema,
  type CreatePartyInput,
  placeTypes,
  placeTypeLabels,
  generateSlugFromAddress,
  generatePartyNameFromAddress,
} from "@/lib/validations/party";
import { createParty, checkSlugAvailability } from "@/lib/actions/party";
import { saveAdminParty } from "@/lib/storage/admin-parties";

import { CoverImageUpload } from "@/components/cover-image-upload";

export function CreatePartyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    slug: string;
    adminToken: string;
  } | null>(null);

  const form = useForm<CreatePartyInput>({
    resolver: zodResolver(createPartySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      placeType: "rue",
      address: "",
      date: new Date(2026, 4, 29).toISOString(), // 29 mai 2026 (Fête des voisins)
      timeStart: "14:00",
      timeEnd: "",
      description: "",
      coverImageUrl: "",
      isPrivate: false,
      accessCode: "",
      organizerName: "",
      organizerEmail: "",
      notifyOnNewParticipant: false,
    },
  });

  const { isValid, dirtyFields } = form.formState;

  // useWatch is more efficient than form.watch() - only subscribes to specific fields
  const watchAddress = useWatch({ control: form.control, name: "address" });
  const watchSlug = useWatch({ control: form.control, name: "slug" });
  const watchIsPrivate = useWatch({ control: form.control, name: "isPrivate" });
  const watchCoverImage = useWatch({ control: form.control, name: "coverImageUrl" });

  // Auto-generate name and slug from address
  useEffect(() => {
    if (watchAddress && watchAddress.length >= 10) {
      // Auto-generate name if empty or was auto-generated before
      const currentName = form.getValues("name");
      const newName = generatePartyNameFromAddress(watchAddress);
      if (!currentName || currentName.startsWith("Fête de la ")) {
        form.setValue("name", newName, { shouldValidate: true });
      }

      // Auto-generate slug only if not manually edited
      if (!dirtyFields.slug) {
        const newSlug = generateSlugFromAddress(watchAddress);
        if (newSlug.length >= 3) {
          form.setValue("slug", newSlug);
        }
      }
    }
  }, [watchAddress, form, dirtyFields.slug]);

  // Check slug availability
  useEffect(() => {
    if (!watchSlug || watchSlug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const available = await checkSlugAvailability(watchSlug);
        setSlugAvailable(available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchSlug]);

  async function onSubmit(data: CreatePartyInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await createParty(data);

      if (result.success) {
        saveAdminParty(result.party.slug, result.party.adminToken);
        setSuccessData(result.party);
      } else {
        // Set form errors
        if (result.error) {
          // Check for general form error
          if ("_form" in result.error) {
            const formErrors = result.error._form as string[];
            setFormError(formErrors?.[0] || "Une erreur est survenue");
          }
          // Set field-specific errors
          Object.entries(result.error).forEach(([key, messages]) => {
            if (key !== "_form" && messages && messages.length > 0) {
              form.setError(key as keyof CreatePartyInput, {
                message: messages[0],
              });
            }
          });
        } else {
          setFormError("Une erreur inattendue est survenue");
        }
      }
    });
  }

  if (successData) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-4 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">&#127881;</span>
          </div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-neighbor-stone mb-4">
            Votre fête est créée !
          </h2>
          <p className="font-[family-name:var(--font-outfit)] text-gray-600 mb-6">
            Partagez ce lien avec vos voisins :
          </p>
          <div className="bg-neighbor-cream rounded-lg p-4 mb-6">
            <code className="text-neighbor-orange font-bold text-lg">
              voisinons.fr/{successData.slug}
            </code>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="font-bold text-yellow-800 mb-2">
              Important : conservez ce lien admin
            </p>
            <p className="text-sm text-yellow-700 mb-2">
              Ce lien (envoyé aussi par email) contient un secret qui donne accès à
              l&apos;administration de votre fête.{" "}
              <strong>Ne le partagez pas publiquement.</strong>
            </p>
            <code className="text-xs bg-yellow-100 p-2 rounded block break-all">
              voisinons.fr/{successData.slug}/admin?token={successData.adminToken}
            </code>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push(`/${successData.slug}`)}
              className="bg-neighbor-stone hover:bg-neighbor-orange"
            >
              Voir la page de ma fête
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/${successData.slug}/admin`)}
            >
              Accéder à l&apos;administration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Address - First, to auto-generate name and slug */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse de la fête *</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name - Auto-generated from address */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la fête *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Fête de la rue Jaboulay"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Généré automatiquement, modifiable si besoin
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Place Type */}
            <FormField
              control={form.control}
              name="placeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de lieu *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {placeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {placeTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la page *</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="bg-gray-100 px-3 py-2 rounded-l-md border border-r-0 text-gray-500 text-sm">
                        voisinons.fr/
                      </span>
                      <Input
                        className="rounded-l-none"
                        placeholder="rue-jaboulay-lyon"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <div className="flex items-center gap-2 mt-1">
                    {checkingSlug && (
                      <span className="text-xs text-gray-500">
                        Vérification...
                      </span>
                    )}
                    {!checkingSlug && slugAvailable === true && (
                      <span className="text-xs text-green-600">
                        &#10003; Disponible
                      </span>
                    )}
                    {!checkingSlug && slugAvailable === false && (
                      <span className="text-xs text-red-600">
                        &#10007; Déjà utilisé
                      </span>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de la fête *</FormLabel>
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

            {/* Time Start and End */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeStart"
                render={({ field }) => {
                  const [hours, minutes] = (field.value || "14:00").split(":").map(Number);
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
                  const [hours, minutes] = (field.value || "21:00").split(":").map(Number);
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre fête, ce que vous prévoyez, etc."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Markdown supporté pour la mise en forme
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image */}
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image d&apos;illustration (optionnel)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {watchCoverImage ? (
                        <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={watchCoverImage}
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
                        <CoverImageUpload
                          onUploaded={(url) => {
                            field.onChange(url);
                            setUploadError(null);
                          }}
                          onError={(message) => setUploadError(message)}
                        />
                        {watchCoverImage && (
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
                    Téléversez une image pour illustrer la fête. Elle apparaîtra en haut de la page.
                  </FormDescription>
                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Private toggle */}
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Fête privée</FormLabel>
                    <FormDescription>
                      Si activé, un code d&apos;accès sera nécessaire pour voir la
                      page
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Access code (if private) */}
            {watchIsPrivate && (
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code d&apos;accès</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: fete2024" {...field} />
                    </FormControl>
                    <FormDescription>
                      Les visiteurs devront entrer ce code pour accéder à la page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="border-t pt-6">
              <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-lg text-neighbor-stone mb-4">
                Vos coordonnées
              </h3>

              {/* Organizer Name */}
              <FormField
                control={form.control}
                name="organizerName"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Votre nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organizer Email */}
              <FormField
                control={form.control}
                name="organizerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ex: jean@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nous vous enverrons le lien d&apos;administration de votre fête
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organizer notification toggle */}
              <FormField
                control={form.control}
                name="notifyOnNewParticipant"
                render={({ field }) => (
                  <FormItem className="mt-4 flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 pr-4">
                      <FormLabel className="text-base">
                        Me notifier des nouvelles inscriptions
                      </FormLabel>
                      <FormDescription>
                        Recevez un email à chaque fois qu&apos;un voisin
                        s&apos;inscrit. Désactivable à tout moment depuis la
                        page d&apos;administration.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-neighbor-orange hover:bg-neighbor-orange/90 text-white font-bold py-6 text-lg"
              disabled={isPending || !isValid || slugAvailable === false}
            >
              {isPending ? "Création en cours..." : "Créer ma fête"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
