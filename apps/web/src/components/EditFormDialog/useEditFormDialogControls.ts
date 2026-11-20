import { useState } from "react";
export interface EditFormDialogControls {
  closeEdit: () => void;
  currentEditId: number | undefined;
}

export function useEditFormDialogControls(): {
  startEdit: (id: number) => void;
  controls: EditFormDialogControls;
} {
  const [currentEditId, setCurrentEditId] = useState<number | undefined>();
  return {
    startEdit: (id) => {
      setCurrentEditId(id);
    },
    controls: {
      closeEdit: () => {
        setCurrentEditId(undefined);
      },
      currentEditId,
    },
  };
}
