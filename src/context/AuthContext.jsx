import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const STORAGE_KEY = "skillfirst_user";
const TOKEN_KEY = "skillfirst_token";

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users from backend
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
      });
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { user, token } = data;
      
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
      
      return user;
    } catch (err) {
      console.error("Login error:", err);
      // Return null to signify failure or throw an error based on the UI expectation.
      // We will throw the error so the UI can catch it and display the message.
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const { user, token } = data;
      
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);

      // Re-fetch users so the local list is updated if needed
      fetch('http://localhost:5000/api/users')
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(console.error);
      
      return user;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateUser = async (updatedUser) => {
    // 1. Instantly update local session for snappy UI
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    // 2. Sync to Backend if there is an ID
    if (updatedUser._id) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${updatedUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
          console.error("Failed to sync user data to backend");
        } else {
          // Re-fetch global user list so recruiters immediately see the new scores
          fetch('http://localhost:5000/api/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(console.error);
        }
      } catch (err) {
        console.error("Error saving user to backend:", err);
      }
    }
    
    return updatedUser;
  };

  const value = useMemo(
    () => ({
      users,
      setUsers,
      currentUser,
      login,
      register,
      logout,
      updateUser,
      loading,
    }),
    [users, currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};