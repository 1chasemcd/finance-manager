import { TextField } from "@mui/material";
import { usePageHeader } from "@/lib/pageHeader";
import { useState } from "react";
import { setDevUserSub } from "@/lib/devUserHeader";

function DebugConsole() {
  usePageHeader({ title: "Debug Console" });

  const [devUserSubState, setDevUserSubState] = useState<string | null>(null);

  const devUserFieldChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDevUserSubState(event.target.value);
    setDevUserSub(event.target.value);
  };

  return (
    <>
      <TextField label="Dev User Sub" value={devUserSubState} onChange={devUserFieldChanged} />
    </>
  );
}

export default DebugConsole;
