import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type UseFormReturn } from "react-hook-form";

type UseFormProps = Parameters<typeof useForm>[0];
interface Zod3Type<O = unknown, I = unknown> {
  _output: O;
  _input: I;
  _def: object;
}
type UseAppFormProps<T> = Omit<UseFormProps, "resolver"> & {
  schema: Zod3Type<T, T>;
};

function camelCaseToWords(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}
export function useAppForm<T extends FieldValues>({
  schema,
  ...props
}: UseAppFormProps<T>): UseFormReturn<T> {
  const { register, ...useFormResult } = useForm({
    resolver: zodResolver(schema),
    ...props,
  });
  return {
    register: (name, ...params) => {
      return {
        ...register(name, ...params),
        error: !!useFormResult.formState.errors[name],
        helperText: useFormResult.formState.errors[name]?.message ?? " ",
        label: camelCaseToWords(name),
      };
    },
    ...useFormResult,
  };
}
