import {useLocalizatedCategories} from "~/use/useLocalizatedCategories";

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  "Fastfood": "Food",
  "Bar": "Food",
  "Fuel": "Car",
  "Energy Bill": "Rental Bill",
  "Water Bill": "Rental Bill",
  "Waste Bill": "Rental Bill",
  "Pet Food": "Pets",
};

const CATEGORY_META_MAP: Record<string, { icon: string; color: string }> = {
  "Food": {icon: "restaurant", color: "#FF7043"},
  "Rental Bill": {icon: "business", color: "#3F51B5"},
  "Car": {icon: "directions_car", color: "#4CAF50"},
  "Health": {icon: "medical_services", color: "#FF5252"},
  "Pets": {icon: "pets", color: "#FFB300"},
};

const CATEGORY_KEYWORDS_MAP: Record<string, string[]> = {
  "Food": [
    "обед",
    "продукты",
    "продукт",
    "еда",
    "магазин",
    "хлеб",
    "овощи",
    "бананы",
    "банан",
    "фрукты",
    "фрукт",
    "перекус",
    "макдак",
    "мак",
    "mcdonalds",
    "mcdonald",
    "burger king",
    "бургер кинг",
  ],
  "Rental Bill": [
    "meravis",
    "меравис",
    "аренда",
    "радио",
    "wasser",
    "hamburg wasser",
    "электричество",
    "vattenfall",
    "интернет",
    "internet",
    "водопровод",
  ],
  "Car": [
    "заправка",
    "бензин",
    "налог на авто",
    "страховка машина",
    "страховка авто",
    "налог на машину",
    "ремонт машины",
    "tuv",
    "tuv ",
    "тюв",
    "замена масла",
    "замена свечей",
    "эвакуатор",
  ],
  "Health": [
    "медикаменты",
    "аптека",
    "витамины",
    "бинты",
    "мазь",
    "таблетки",
  ],
};

export const getCanonicalCategoryName = (categoryName: string = "") => {
  return CATEGORY_ALIAS_MAP[categoryName] || categoryName;
};

export const getCategoryDisplayName = (categoryName: string = "", locale: string = "en") => {
  return useLocalizatedCategories(getCanonicalCategoryName(categoryName), locale);
};

export const getCategoryDisplayMeta = (
  category: {name?: string; rawName?: string; icon?: string; color?: string} = {},
  locale: string = "en"
) => {
  const rawName = category.rawName || category.name || "";
  const canonicalName = getCanonicalCategoryName(rawName);
  const canonicalMeta = CATEGORY_META_MAP[canonicalName] || {};

  return {
    rawName,
    canonicalName,
    name: getCategoryDisplayName(rawName, locale),
    icon: canonicalMeta.icon || category.icon || "category",
    color: canonicalMeta.color || category.color || "#BDBDBD",
  };
};

export const buildVisibleCategoryOptions = (
  categories: Array<Record<string, any>> = [],
  locale: string = "en"
) => {
  const categoriesByRawName = new Map(
    categories.map((category) => [category.rawName || category.name, category])
  );
  const seenCanonicalNames = new Set<string>();

  return categories.reduce<Array<Record<string, any>>>((result, category) => {
    const rawName = category.rawName || category.name;
    const canonicalName = getCanonicalCategoryName(rawName);

    if (!canonicalName || seenCanonicalNames.has(canonicalName)) {
      return result;
    }

    seenCanonicalNames.add(canonicalName);

    const sourceCategory = categoriesByRawName.get(canonicalName) || category;
    const displayMeta = getCategoryDisplayMeta({
      ...sourceCategory,
      rawName: canonicalName,
      name: canonicalName,
    }, locale);

    result.push({
      value: sourceCategory._id || sourceCategory.id || sourceCategory.value,
      rawName: sourceCategory.rawName || sourceCategory.name,
      canonicalName,
      label: displayMeta.name,
      icon: displayMeta.icon,
      color: displayMeta.color,
    });

    return result;
  }, []);
};

export const mergeCategoryAmounts = (
  items: Array<{category: string; amount: number}> = [],
  locale: string = "en"
) => {
  const totals = new Map<string, number>();

  items.forEach((item) => {
    const canonicalName = getCanonicalCategoryName(item.category);
    totals.set(canonicalName, (totals.get(canonicalName) || 0) + Number(item.amount || 0));
  });

  return Array.from(totals.entries()).map(([category, amount]) => ({
    category: getCategoryDisplayName(category, locale),
    amount: Number(amount.toFixed(2)),
  }));
};

const normalizeDescription = (value: string = "") => {
  return value
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const inferCategoryOptionByDescription = (
  description: string,
  categories: Array<Record<string, any>> = []
) => {
  const normalizedDescription = normalizeDescription(description);

  if (!normalizedDescription) {
    return null;
  }

  for (const [canonicalName, keywords] of Object.entries(CATEGORY_KEYWORDS_MAP)) {
    const hasMatch = keywords.some((keyword) => normalizedDescription.includes(keyword.toLowerCase()));

    if (!hasMatch) {
      continue;
    }

    const matchedOption = categories.find((category) => category.canonicalName === canonicalName);

    if (matchedOption) {
      return matchedOption;
    }
  }

  return null;
};
