import { usePageHeader } from "@/lib/pageHeader";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { Edit } from "@mui/icons-material";
import { useState } from "react";
import { updateCategorySchema, type UpdateCategoryRequest } from "@finapp/schema";
import { useAppForm } from "@/lib/appForm";
import React from "react";

function useCategoryDialog(): [(id: number) => void, React.JSX.Element] {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number | undefined>();

  const { register, handleSubmit, ...form } = useAppForm({
    schema: updateCategorySchema,
  });

  const onSubmit = (_data: UpdateCategoryRequest) => {
    // .mutate(data, {
    //   onSuccess: () => {
    //     handleDialogClose();
    //     setSnackbar({ open: true, message: "Invitation sent", severity: "success" });
    //   },
    //   onError: () => {
    //     setSnackbar({
    //       open: true,
    //       message: "The invitation could not be sent",
    //       severity: "error",
    //     });
    //   },
    // });
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const handleOpen = (id: number) => {
    setCategoryId(id);
    setOpen(true);
  };

  return [
    handleOpen,
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{categoryId ? "Edit Category" : "Add Category"}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          id="category-form"
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField {...register("name")} fullWidth />
          <TextField {...register("description")} fullWidth multiline rows={3} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="category-form">
          Save
        </Button>
      </DialogActions>
    </Dialog>,
  ];
}

function Categories() {
  usePageHeader({
    title: "Categories",
    actions: <Button>Add Category</Button>,
  });
  const [handleOpen, CategoryDialog] = useCategoryDialog();
  const { data } = {
    data: [
      { id: 1, name: "Groceries", description: "Food and supplies" },
      { id: 2, name: "Automotive", description: "Vehicle maintenance and insurance costs" },
      { id: 3, name: "Rent" },
    ],
  };
  return (
    <React.Fragment>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
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
                      handleOpen(row.id);
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
      {CategoryDialog}
    </React.Fragment>
  );
}

export default Categories;
