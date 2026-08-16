import type React from "react";
import { Route, Routes, useParams } from "react-router";

type EditFormProps = {
  id: number;
};

type EntityTableRouterProps = {
  index: React.ReactNode;
  AddForm?: React.ComponentType | undefined;
  EditForm?: React.ComponentType<EditFormProps> | undefined;
};

function EditFormWrapper({
  EditForm,
}: {
  EditForm: React.ComponentType<EditFormProps>;
}) {
  const { id } = useParams();
  return <EditForm id={Number(id)} />;
}

export default function EntityTableRouter({
  index,
  EditForm,
  AddForm,
}: EntityTableRouterProps) {
  return (
    <Routes>
      <Route index element={index} />
      {EditForm && (
        <Route
          path=":id/edit"
          element={<EditFormWrapper EditForm={EditForm} />}
        />
      )}
      {AddForm && <Route path="add" element={<AddForm />} />}
    </Routes>
  );
}
