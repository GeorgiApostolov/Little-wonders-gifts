export type ServiceCatalogMeta = {
  title: string;
  priceLabel: string;
};

export const standardServicePriceNote =
  "Цената е за показаните стандартни варианти.";

export const customColorInquiryText =
  "За различна комбинация от цветове се прави запитване.";

const serviceCatalogBySlug: Record<string, ServiceCatalogMeta> = {
  "pacifier-clips": {
    title: "Клипсове за биберон с име",
    priceLabel: "20€",
  },
  "photo-frame": {
    title: "Рамка за снимка",
    priceLabel: "25€",
  },
  platform: {
    title: "Полуовална платформа",
    priceLabel: "30€",
  },
  "round-platform": {
    title: "Кръгла платформа",
    priceLabel: "35€",
  },
  "letter-blocks": {
    title: "Кубчета",
    priceLabel: "5€ / бр.",
  },
};

export const normalizeServiceSlug = (slug?: string) => {
  if (!slug) {
    return undefined;
  }

  return slug === "blocks" ? "letter-blocks" : slug;
};

export const getServiceCatalogMeta = (slug?: string) => {
  const normalizedSlug = normalizeServiceSlug(slug);

  if (!normalizedSlug) {
    return undefined;
  }

  return serviceCatalogBySlug[normalizedSlug];
};
