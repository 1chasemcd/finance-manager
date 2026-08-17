import AppDatePicker from "@/components/AppDatePicker.tsx";
import type { SearchTransactionData } from "@/lib/generated";
import { Form, type FormInstance } from "antd";

type TransactionQuery = NonNullable<SearchTransactionData["query"]>;

type TransactionsFilterPageProps = {
  form: FormInstance<TransactionQuery>;
};

export default function TransactionsFilterPage({
  form,
}: TransactionsFilterPageProps) {
  return (
    <Form<TransactionQuery> form={form} layout="vertical">
      <Form.Item<TransactionQuery> label="Date Range" name="MinDate">
        <AppDatePicker style={{ width: "100%" }} placeholder={"From"} />
      </Form.Item>
    </Form>
  );
}
