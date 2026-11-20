import { usePageHeader } from "@/lib/pageHeader";
import {
  Alert,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { Add, Edit, FilterAlt } from "@mui/icons-material";
import { useEffect } from "react";
import { updateCategorySchema } from "@finapp/schema";
import { useAppForm } from "@/lib/appForm";
import React from "react";
import {
  useDeleteCategory,
  useQueryCategories,
  useQueryCategory,
  useUpdateCategory,
} from "@/lib/api/category";
import { usePageStatus } from "@/lib/pageStatus";
import { useWatch } from "react-hook-form";
import AppPaper from "@/components/AppPaper";
import {
  useEditFormDialogControls,
  type EditFormDialogControls,
} from "@/components/EditFormDialog/useEditFormDialogControls";
import { EditFormDialog } from "@/components/EditFormDialog/EditFormDialog";

function CategoryEdit({ controls }: { controls: EditFormDialogControls }) {
  const form = useAppForm({
    schema: updateCategorySchema,
  });
  const { register, setValue, control } = form;
  const isArchived = useWatch({
    control,
    name: "archived",
  });
  return (
    <EditFormDialog
      form={form}
      controls={controls}
      useQueryEntity={useQueryCategory}
      useUpdateEntity={useUpdateCategory}
      useDeleteEntity={useDeleteCategory}
    >
      <TextField {...register("name")} fullWidth disabled={isArchived} />
      <TextField {...register("description")} fullWidth disabled={isArchived} multiline rows={3} />
      <Alert
        severity="info"
        action={
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setValue("archived", !isArchived);
            }}
          >
            {isArchived ? "Reopen" : "Archive"}
          </Button>
        }
      >
        Category is {isArchived ? "archived" : "active"}.
      </Alert>
    </EditFormDialog>
  );
}

function Categories() {
  usePageHeader({
    title: "Categories",
    actions: [
      <Button size="small" startIcon={<FilterAlt />}>
        Filter
      </Button>,
      <Button variant="contained" size="small" startIcon={<Add />}>
        Add
      </Button>,
    ],
  });
  const { startEdit, controls } = useEditFormDialogControls();
  const { data, isPending, isError } = useQueryCategories();

  const { resetStatus, setLoadingStatus, setErrorStatus } = usePageStatus();

  useEffect(() => {
    if (isPending) setLoadingStatus();
    else if (isError) setErrorStatus();
    else resetStatus();
  }, [isPending, isError, resetStatus, setLoadingStatus, setErrorStatus]);

  return (
    <React.Fragment>
      <TableContainer component={AppPaper} sx={{ maxHeight: "100%" }}>
        <Table stickyHeader size="small" aria-label="category table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      startEdit(row.id);
                    }}
                    aria-label={`Edit ${row.name}`}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CategoryEdit controls={controls} />
    </React.Fragment>
  );
}

export default Categories;
