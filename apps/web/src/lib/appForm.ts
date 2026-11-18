import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type z from "zod";

type UseAppFormProps<
  TInput extends FieldValues,
  TOutput extends FieldValues,
> = Omit<UseFormProps<TInput, unknown, TOutput>, "resolver"> & {
  schema: z.ZodType<TOutput, TInput>;
};

function camelCaseToWords(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}
export function useAppForm<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
>({
  schema,
  ...props
}: UseAppFormProps<TInput, TOutput>): UseFormReturn<TInput, unknown, TOutput> {
  const { register, ...useFormResult } = useForm<TInput, unknown, TOutput>({
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
