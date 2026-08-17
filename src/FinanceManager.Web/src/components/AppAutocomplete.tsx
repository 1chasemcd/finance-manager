import type { AutocompleteQueryResponse } from "@/lib/generated";
import type { AutocompleteRequestOptions } from "@/lib/types/autocomplete";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import React, { useState } from "react";
import { useDebounce } from "use-debounce";

interface AppAutocompleteProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  requestOptions: AutocompleteRequestOptions;
}

function transformAutocompleteResponse(
  autocompleteResponse: AutocompleteQueryResponse,
) {
  return { value: autocompleteResponse.id, label: autocompleteResponse.value };
}

export default function AppAutocomplete({
  value,
  onChange,
  requestOptions,
  ...props
}: AppAutocompleteProps & React.ComponentProps<typeof Select>) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 300);

  const { data, isFetching } = useQuery({
    ...requestOptions.search({
      query: { search: debouncedSearchText, take: 50, skip: 0 },
    }),
    enabled: hasBeenFocused,
  });

  const { data: selectedOption, isFetching: isFetchingSelectedOption } =
    useQuery({
      ...requestOptions.byId({
        path: { id: value! },
      }),
      enabled: value != null && !data?.some((x) => x.id === value),
    });

  const options = data?.map(transformAutocompleteResponse) ?? [];
  if (selectedOption && !options.find((o) => o.value === selectedOption.id))
    options.unshift(transformAutocompleteResponse(selectedOption));

  return (
    <Select
      {...props}
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
