import AppAutocomplete from "@/components/AppAutocomplete";
import AppDatePicker from "@/components/AppDatePicker.tsx";
import { transactionCategoryAutocomplete } from "@/utils/autocompleteRequests";
import type { SearchTransactionData } from "@/lib/generated";
import { Form, type FormInstance } from "antd";
import dayjs, { Dayjs } from "dayjs";

type TransactionQuery = NonNullable<SearchTransactionData["query"]>;

type TransactionsFilterPageProps = {
  form: FormInstance<TransactionQuery>;
};

export default function TransactionsFilter({
  form,
}: TransactionsFilterPageProps) {
  return (
    <Form<TransactionQuery> form={form} layout="vertical">
      <Form.Item<TransactionQuery>
        label="Date Range"
        name="MinDate"
        getValueProps={(value?: Date | null | undefined) => ({
          value: value ? dayjs(value) : null,
        })}
        getValueFromEvent={(value: Dayjs) => value?.toDate() ?? null}
      >
        <AppDatePicker style={{ width: "100%" }} placeholder={"From"} />
      </Form.Item>
      <Form.Item<TransactionQuery>
        label="Category"
        name="TransactionCategoryId"
      >
        <AppAutocomplete requestOptions={transactionCategoryAutocomplete} />
      </Form.Item>
    </Form>
  );
}
