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
import { usePageStatus } from "@/lib/pageStatus";

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
  const { setLoadingStatus, resetStatus } = usePageStatus();

  useEffect(() => {
    if (isFetching) setLoadingStatus();
    else resetStatus();
  }, [isFetching, setLoadingStatus, resetStatus]);

  const updateEntity = useUpdateEntity?.();
  const deleteEntity = useDeleteEntity?.();

  const open = currentEditId !== undefined;
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (isSuccess) reset(data);
  }, [isSuccess, data, reset]);

  const handleClose = () => {
    closeEdit();
    form.reset();
  };

  const onSubmit = (json: TOutput) => {
    if (!currentEditId || !updateEntity) return;
    updateEntity.mutate({ id: currentEditId, json }, { onSuccess: handleClose });
  };

  const onDelete = () => {
    if (!currentEditId || !deleteEntity) return;
    deleteEntity.mutate(currentEditId, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open && isSuccess} onClose={handleClose} fullWidth maxWidth="sm">
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
          {children}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        {deleteEntity && <ConfirmationButton onClick={onDelete}>Delete</ConfirmationButton>}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleClose}>{updateEntity ? "Cancel" : "Close"}</Button>
        {updateEntity && (
          <Button variant="contained" type="submit" form="edit-form">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
