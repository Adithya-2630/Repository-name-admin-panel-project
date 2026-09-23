import { useState } from "react";
import UserDashboard from "./UserDashboard";

const API_URL = "http://localhost:3000";

function UserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      setUser(data.account);
    } catch {
      setMessage("Unable to connect to backend");
    }
  };

  if (user) {
    return <UserDashboard accountId={user.id} />;
  }

  return (
    <div
      className="user-login-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "45px",
          borderRadius: "20px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.10)"
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#111827"
          }}
        >
          Employee Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "30px"
          }}
        >
          Sign in to view your attendance
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "18px",
              boxSizing: "border-box",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "15px"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              boxSizing: "border-box",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "15px"
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
        </form>

        {message && (
          <p
            style={{
              textAlign: "center",
              color: "#dc2626",
              fontWeight: "600",
              marginTop: "20px"
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default UserLogin;