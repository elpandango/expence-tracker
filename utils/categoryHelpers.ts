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

    const matchedOption = categories.find((category) => (category.rawName || category.name) === canonicalName);

    if (matchedOption) {
      return matchedOption;
    }
  }

  return null;
};
