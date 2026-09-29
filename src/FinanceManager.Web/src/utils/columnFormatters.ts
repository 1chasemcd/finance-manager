export const dateColumn: {
  render: (date: Date | null | undefined) => string;
  align: "right";
} = {
  render: (date: Date | null | undefined) =>
    date?.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }) ?? "",
  align: "right",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  currencySign: "accounting",
});

export const currencyColumn: {
  render: (amount: number | null | undefined) => string;
  align: "right";
} = {
  render: (amount: number | null | undefined) =>
    currencyFormatter.format(amount ?? 0),
  align: "right",
};
