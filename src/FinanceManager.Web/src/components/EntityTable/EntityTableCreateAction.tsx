import { Plus } from "lucide-react";
import { LinkButton } from "../LinkButton";

export default function EntityTableCreateAction() {
  return (
    <LinkButton to="./add" type="primary" icon={<Plus size={16} />}>
      Add
    </LinkButton>
  );
}
