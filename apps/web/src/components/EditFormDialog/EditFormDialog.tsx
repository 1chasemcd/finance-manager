import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { ConfirmationButton } from "../ConfirmationButton";
import type { EditFormDialogControls } from "./useEditFormDialogControls";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import PageSpinner from "../PageSpinner";
import Remount from "../Remount";

interface EditFormDialogProps<TInput extends FieldValues, TContext, TOutput extends FieldValues> {
  children: React.ReactNode;
  controls: EditFormDialogControls;
  form: UseFormReturn<TInput, TContext, TOutput>;
  useQueryEntity: (id: number | null | undefined) => UseQueryResult<TInput>;
  useUpdateEntity?: () => UseMutationResult<
    void,
    Error,
    {
      id: number;
      json: TOutput;
    }
  >;
  useDeleteEntity?: () => UseMutationResult<void, Error, number>;
}

export function EditFormDialog<
  TInput extends FieldValues,
  TContext,
  TOutput extends FieldValues = TInput,
>({
  children,
  controls: { closeEdit, currentEditId },
  form,
  useQueryEntity,
  useUpdateEntity,
  useDeleteEntity,
}: EditFormDialogProps<TInput, TContext, TOutput>) {
  const { data, isSuccess, isFetching } = useQueryEntity(currentEditId);
  const updateEntity = useUpdateEntity?.();
  const deleteEntity = useDeleteEntity?.();

  const open = currentEditId !== undefined;
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (isSuccess) reset(data, { keepDefaultValues: true });
    else if (open) reset();
  }, [isSuccess, data, reset, open]);

  const onSubmit = (json: TOutput) => {
    if (!currentEditId || !updateEntity) return;
    updateEntity.mutate({ id: currentEditId, json }, { onSuccess: closeEdit });
  };

  const onDelete = () => {
    if (!currentEditId || !deleteEntity) return;
    deleteEntity.mutate(currentEditId, { onSuccess: closeEdit });
  };

  return (
    <Dialog open={open} onClose={closeEdit} fullWidth maxWidth="sm">
      <PageSpinner visible={open && isFetching} />
      <DialogTitle>Edit</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          id="edit-form"
          sx={{ mt: 1 }}
          noValidate
        >
          <Remount watch={isFetching}>{children}</Remount>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        {deleteEntity && <ConfirmationButton onClick={onDelete}>Delete</ConfirmationButton>}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={closeEdit}>{updateEntity ? "Cancel" : "Close"}</Button>
        {updateEntity && (
          <Button variant="contained" type="submit" form="edit-form">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
