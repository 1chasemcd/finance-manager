import { TextField, Button } from "@mui/material";
import { api } from "./lib/api";
import { useState } from "react";

async function runCalculate(
  number1: number,
  number2: number,
): Promise<number | null> {
  const response = await api.multiply.$post({
    json: {
      number1,
      number2,
    },
  });
  if (response.ok) return (await response.json()).result;
  return null;
}

function App() {
  const [number1, setNumber1] = useState<number>(0);
  const [number2, setNumber2] = useState<number>(0);

  const [result, setResult] = useState<number | null>(null);
  return (
    <>
      <TextField
        label="Number 1"
        type="number"
        value={number1}
        onChange={(e) => {
          setNumber1(Number(e.target.value));
        }}
      />
      <TextField
        label="Number 2"
        type="number"
        value={number2}
        onChange={(e) => {
          setNumber2(Number(e.target.value));
        }}
      />
      <Button
        onClick={() => {
          runCalculate(number1, number2)
            .then(setResult)
            .catch(() => {
              console.error("Something went wrong");
            });
        }}
      >
        Multiply Numbers
      </Button>
      <h6>Result is: {result?.toString() ?? ""}</h6>
    </>
  );
}

export default App;
