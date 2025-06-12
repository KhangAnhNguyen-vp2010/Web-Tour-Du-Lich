import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (username, password) => {
    if (username === "admin" && password === "123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} error={error} />
      )}
    </div>
  );
}

export default App;
