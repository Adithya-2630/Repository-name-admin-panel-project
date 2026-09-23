import { useState } from "react";

const API_URL = "http://localhost:3000";

function Login({ onLogin, role, onBack }) {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const isAdmin = role === "admin";
  const isUser = role === "user";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !identifier.trim() ||
      !password.trim() ||
      (isRegistering && !email.trim())
      || (isRegistering && (!fullName.trim() || !phone.trim()))
    ) {
      setError("Please enter all details");
      return;
    }

    if (isRegistering && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${isRegistering ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            username: identifier,
            ...(isRegistering
              ? { email, full_name: fullName, phone }
              : {}),
            password
          })
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        setError(
          data.message ||
            `The server does not support ${isRegistering ? "registration" : "login"} yet. Restart the backend and try again.`
        );
        return;
      }

      if (!isRegistering && data.role !== role) {
        setError(`This account is not an ${role} account`);
        return;
      }

      onLogin(data);
    } catch {
      setError("Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`auth-page ${
        isAdmin
          ? "admin-login-page"
          : isUser
            ? "user-login-page"
            : "employee-login-page"
      }`}
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 10px 35px rgba(15,23,42,0.08)"
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#111827",
            marginBottom: "8px"
          }}
        >
          {isAdmin
            ? "Admin Login"
            : isUser
              ? isRegistering
                ? "Create User Account"
                : "User Login"
              : "Employee Login"}
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "30px"
          }}
        >
          {isAdmin
            ? "Login to manage the store"
            : isUser
              ? isRegistering
                ? "Create an account and receive 10,000 wallet points"
                : "Login to start shopping"
              : "Login to access employee attendance"}
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
              color: "#374151"
            }}
          >
            {isAdmin || isUser ? "Username" : "Employee ID"}
          </label>

          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={
              isAdmin
                ? "Enter admin username"
                : isUser
                  ? "Enter username"
                  : "Enter employee ID"
            }
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "18px",
              boxSizing: "border-box",
              fontSize: "15px"
            }}
          />

          {isRegistering && (
            <>
              <label style={{ display: "block", marginBottom: "7px", fontWeight: "700", color: "#374151" }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  boxSizing: "border-box",
                  fontSize: "15px"
                }}
              />
              <label style={{ display: "block", marginBottom: "7px", fontWeight: "700", color: "#374151" }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                maxLength="10"
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 10-digit mobile number"
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  boxSizing: "border-box",
                  fontSize: "15px"
                }}
              />
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "700",
                  color: "#374151"
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  boxSizing: "border-box",
                  fontSize: "15px"
                }}
              />
            </>
          )}

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
              color: "#374151"
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "18px",
              boxSizing: "border-box",
              fontSize: "15px"
            }}
          />

          {error && (
            <div
              style={{
                color: "#dc2626",
                background: "#fef2f2",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#111827",
              color: "white",
              fontWeight: "800",
              fontSize: "15px",
              cursor: "pointer"
            }}
          >
            {loading
              ? isRegistering
                ? "Creating account..."
                : "Logging in..."
              : isRegistering
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        {isUser && (
          <button
            type="button"
            onClick={() => {
              setIsRegistering((current) => !current);
              setError("");
            }}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              border: "none",
              background: "transparent",
              color: "#4f46e5",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {isRegistering
              ? "Already have an account? Log in"
              : "New user? Create an account"}
          </button>
        )}

        <button
          onClick={onBack}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            background: "white",
            color: "#374151",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default Login;