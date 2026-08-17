import { type MenuProps } from "antd";
import { Link } from "react-router";

type ItemType = NonNullable<MenuProps["items"]>[0];

export default function useEditActionForTable(): (id: number) => ItemType {
  return (id: number) => ({
    key: "edit",
    label: (
      <Link type="text" to={`./${id}/edit`}>
        Edit
      </Link>
    ),
  });
}
