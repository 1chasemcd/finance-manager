import AppAutocomplete from "@/components/AppAutocomplete";
import AppDatePicker, {
  dateConverterProps,
} from "@/components/AppDatePicker.tsx";
import {
  personAutocomplete,
  transactionCategoryAutocomplete,
  transactionSourceAutocomplete,
} from "@/utils/autocompleteRequests";
import type { SearchTransactionData } from "@/lib/generated";
import { Flex, Form, type FormInstance } from "antd";
import InputCurrency from "@/components/InputCurrency";

type TransactionQuery = NonNullable<SearchTransactionData["query"]>;

type TransactionsFilterPageProps = {
  form: FormInstance<TransactionQuery>;
};

export default function TransactionsFilter({
  form,
}: TransactionsFilterPageProps) {
  return (
    <Form<TransactionQuery> form={form} layout="vertical">
      <Form.Item label="Date Range">
        <Flex gap="small">
          <Form.Item<TransactionQuery>
            {...dateConverterProps}
            name="MinDate"
            noStyle
            style={{ flex: 1 }}
          >
            <AppDatePicker placeholder="From" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item<TransactionQuery>
            {...dateConverterProps}
            name="MaxDate"
            noStyle
            style={{ flex: 1 }}
          >
            <AppDatePicker placeholder="To" style={{ width: "100%" }} />
          </Form.Item>
        </Flex>
      </Form.Item>

      <Form.Item label="Amount Range">
        <Flex gap="small">
          <Form.Item<TransactionQuery>
            name="MinAmount"
            noStyle
            style={{ flex: 1 }}
          >
            <InputCurrency placeholder="Low" />
          </Form.Item>
          <Form.Item<TransactionQuery>
            name="MaxAmount"
            noStyle
            style={{ flex: 1 }}
          >
            <InputCurrency placeholder="High" />
          </Form.Item>
        </Flex>
      </Form.Item>

      <Form.Item<TransactionQuery> label="Source" name="TransactionSourceId">
        <AppAutocomplete requestOptions={transactionSourceAutocomplete} />
      </Form.Item>

      <Form.Item<TransactionQuery>
        label="Category"
        name="TransactionCategoryId"
      >
        <AppAutocomplete requestOptions={transactionCategoryAutocomplete} />
      </Form.Item>

      <Form.Item<TransactionQuery> label="Owner">
        <AppAutocomplete
          placeholder="Note: Not yet implemented"
          requestOptions={personAutocomplete}
        />
      </Form.Item>
    </Form>
  );
}
