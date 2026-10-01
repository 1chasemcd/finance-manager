import {
  AccountBalance,
  Category,
  CloudUpload,
  Dashboard,
  Description,
  People,
  Payments,
  Rule,
} from "@mui/icons-material";

export const navItems = [
  { label: "Dashboard", icon: Dashboard },
  { label: "Transactions", icon: Payments },
  { label: "Import Batch", icon: CloudUpload },
  { label: "Categories", icon: Category },
  { label: "Sources", icon: AccountBalance },
  { label: "File Formats", icon: Description },
  { label: "Category Rules", icon: Rule },
  { label: "Account", icon: People },
];
