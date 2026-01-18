import type { Need } from "@/lib/db/schema";
import { needCategoryEnum } from "@/lib/db/schema";

export type NeedCategory = (typeof needCategoryEnum.enumValues)[number];

export const needCategoryLabels: Record<NeedCategory, string> = {
  nourriture_sale: "Salé",
  nourriture_sucre: "Sucré",
  boissons_alcool: "Boissons alcoolisées",
  boissons_sans_alcool: "Boissons",
  mobilier: "Mobilier",
  materiel: "Vaisselle",
  animations: "Jeux",
  nettoyage: "Nettoyage",
  autre: "Autre",
};

export const needCategoryIcons: Record<NeedCategory, string> = {
  nourriture_sale: "🥗",
  nourriture_sucre: "🍰",
  boissons_alcool: "🥤",
  boissons_sans_alcool: "🥤",
  mobilier: "🪑",
  materiel: "🍽️",
  animations: "🎲",
  nettoyage: "🧹",
  autre: "📦",
};

export const defaultNeedCategories: Array<{ category: NeedCategory; label: string }> = [
  { category: "boissons_sans_alcool", label: "Boissons" },
  { category: "nourriture_sucre", label: "Sucré" },
  { category: "nourriture_sale", label: "Salé" },
  { category: "materiel", label: "Vaisselle" },
  { category: "animations", label: "Jeux" },
  { category: "mobilier", label: "Mobilier" },
  { category: "autre", label: "Autre" },
];

export type NeedLike = Pick<Need, "id" | "category" | "description"> & {
  isDefault?: boolean;
};

export const defaultNeedItems: NeedLike[] = defaultNeedCategories.map((item) => ({
  id: `default:${item.category}`,
  category: item.category,
  description: item.label,
  isDefault: true,
}));

export function mergeNeedsWithDefaults(needs: Need[]): NeedLike[] {
  const result: NeedLike[] = [];
  const usedIds = new Set<string>();

  for (const def of defaultNeedItems) {
    const matching = needs.find(
      (need) =>
        need.category === def.category && need.description === def.description
    );

    if (matching) {
      result.push({ ...matching, isDefault: true });
      usedIds.add(matching.id);
    } else {
      result.push(def);
    }
  }

  for (const need of needs) {
    if (!usedIds.has(need.id)) {
      result.push({ ...need, isDefault: false });
    }
  }

  return result;
}

export function getNeedLabel(need: Pick<Need, "category" | "description">): string {
  if (need.category === "autre" && need.description) {
    return need.description;
  }
  return needCategoryLabels[need.category as NeedCategory] || need.description;
}

export function getNeedIcon(need: Pick<Need, "category">): string {
  return needCategoryIcons[need.category as NeedCategory] || "📦";
}
