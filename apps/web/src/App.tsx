import {
  Alert,
  CircularProgress,
  List,
  ListItemText,
  ListItem,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "./lib/api";

type User = {
  id: number;
  firstName: string;
  lastName: string;
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.users.$get();

        if (!response.ok) {
          setError(true);
          return;
        }

        const data = await response.json();
        setUsers(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers().catch(() => {
      setError(true);
    });
  }, []);
  return (
    <Box sx={{ p: 2 }}>
      {error && <Alert severity="error">Something went wrong</Alert>}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {users.length > 0 && (
        <List>
          {users.map((user) => (
            <ListItem key={user.id} divider>
              <ListItemText primary={`${user.firstName} ${user.lastName}`} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default App;
