import type { SearchEntityQuery } from "@/lib/types";
import { Button, Drawer, Form, Space, type FormInstance } from "antd";
import { Funnel } from "lucide-react";
import { useState } from "react";

type EntityTableFilterActionProps<TQuery extends SearchEntityQuery> = {
  FilterForm: React.ComponentType<{ form: FormInstance<TQuery> }>;
  query: TQuery;
  updateQuery: (query: TQuery) => void;
};

export default function EntityTableFilterAction<
  TQuery extends SearchEntityQuery,
>({ FilterForm, query, updateQuery }: EntityTableFilterActionProps<TQuery>) {
  const [filterForm] = Form.useForm<TQuery>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const openFiltersForm = () => {
    filterForm.setFieldsValue(query);
    setFiltersOpen(true);
  };

  const applyFiltersFromForm = () => {
    setFiltersOpen(false);
    updateQuery({ ...filterForm.getFieldsValue(), skip: 0 });
  };

  return (
    <>
      <Button onClick={openFiltersForm} icon={<Funnel size={16} />}>
        Filter
      </Button>
      <Drawer
        title="Filter Results"
        onClose={() => setFiltersOpen(false)}
        open={filtersOpen}

        extra={
          <Space size="small">
            <Button onClick={() => filterForm.resetFields()}>Reset</Button>
            <Button type="primary" onClick={applyFiltersFromForm}>
              Apply
            </Button>
          </Space>
        }
      >
        <FilterForm form={filterForm} />
      </Drawer>
    </>
  );
}
