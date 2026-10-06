import { usePageHeader } from "../lib/pageHeader";

function Dashboard() {
  usePageHeader({ title: "Dashboard" });
  return <>Dashboard Works!</>;
}

export default Dashboard;
