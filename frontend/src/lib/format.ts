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

