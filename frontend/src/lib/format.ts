const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tokyo"
});

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "未設定";
  }

  return formatter.format(new Date(value));
};

export const formatDate = (value?: string | null) => {
  if (!value) {
    return "未設定";
  }

  return value.slice(0, 10);
};

export const summarizeText = (value?: string | null, maxLength = 96) => {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength).trim()}…` : normalized;
};
