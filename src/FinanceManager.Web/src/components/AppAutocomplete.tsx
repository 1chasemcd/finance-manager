import type { AutocompleteQueryResponse } from "@/lib/generated";
import {
  getApiAutocompleteSpendingcategoryByIdOptions,
  getApiAutocompleteSpendingcategoryOptions,
} from "@/lib/generated/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import { useState } from "react";
import { useDebounce } from "use-debounce";

interface AppAutocompleteProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
}

function transformAutocompleteResponse(
  autocompleteResponse: AutocompleteQueryResponse,
) {
  return { value: autocompleteResponse.id, label: autocompleteResponse.value };
}

export default function AppAutocomplete({
  value,
  onChange,
}: AppAutocompleteProps) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 300);

  const { data, isFetching } = useQuery({
    ...getApiAutocompleteSpendingcategoryOptions({
      query: { search: debouncedSearchText, take: 50, skip: 0 },
    }),
    enabled: hasBeenFocused,
  });

  const { data: selectedOption, isFetching: isFetchingSelectedOption } =
    useQuery({
      ...getApiAutocompleteSpendingcategoryByIdOptions({
        path: { id: value! },
      }),
      enabled: value != null && !data?.some((x) => x.id === value),
    });

  const options = data?.map(transformAutocompleteResponse) ?? [];
  if (selectedOption && !options.find((o) => o.value === selectedOption.id))
    options.unshift(transformAutocompleteResponse(selectedOption));

  return (
    <Select
      value={value ?? null}
      onChange={onChange ?? ((_) => {})}
      showSearch={{ filterOption: false, onSearch: setSearchText }}
      options={options}
      loading={isFetching || isFetchingSelectedOption}
      onFocus={() => setHasBeenFocused(true)}
      placeholder="Search spending category"
    />
  );
}
