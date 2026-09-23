import EmployeeDashboard from "./EmployeeDashboard";
import { useState } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

const API_URL = "http://localhost:3000";

function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogin = (account) => {
    setUser(account);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {
      console.log("Logout error");
    }

    setUser(null);
    setRole(null);
  };

  // ROLE SELECTION
  if (!role) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(rgba(5, 10, 25, 0.72), rgba(8, 15, 35, 0.82)), url('https://thumbs.dreamstime.com/b/seamless-electronic-products-background-19840269.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "850px",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "28px",
            padding: "45px",
            boxSizing: "border-box",
            boxShadow: "0 25px 70px rgba(0,0,0,0.35)"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "38px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "70px",
                height: "70px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "36px",
                marginBottom: "18px"
              }}
            >
              ⚡
            </div>

            <p
              style={{
                fontSize: "12px",
                letterSpacing: "4px",
                fontWeight: "800",
                color: "#cbd5e1",
                margin: "0 0 12px"
              }}
            >
              ELECTRONICS STORE
            </p>

            <h1
              style={{
                fontSize: "46px",
                color: "white",
                margin: "0 0 12px",
                fontWeight: "800",
                lineHeight: "1.1"
              }}
            >
              Welcome
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                margin: 0,
                fontSize: "16px"
              }}
            >
              Technology, management and shopping — all in one place.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px"
            }}
          >
            {/* ADMIN */}
            <button
              onClick={() => setRole("admin")}
              style={{
                padding: "26px 22px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.94)",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 18px 35px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(0,0,0,0.15)";
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "15px",
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "16px"
                }}
              >
                🔐
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#111827"
                }}
              >
                Admin
              </div>

              <div
                style={{
                  color: "#64748b",
                  marginTop: "7px",
                  fontSize: "13px",
                  lineHeight: "1.5"
                }}
              >
                Manage employees, products and attendance.
              </div>

              <div
                style={{
                  marginTop: "18px",
                  color: "#4f46e5",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                ENTER PANEL →
              </div>
            </button>

            {/* EMPLOYEE */}
            <button
              onClick={() => setRole("employee")}
              style={{
                padding: "26px 22px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.94)",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 18px 35px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(0,0,0,0.15)";
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "15px",
                  background: "#ecfdf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "16px"
                }}
              >
                👨‍💼
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#111827"
                }}
              >
                Employee
              </div>

              <div
                style={{
                  color: "#64748b",
                  marginTop: "7px",
                  fontSize: "13px",
                  lineHeight: "1.5"
                }}
              >
                Login and manage your attendance.
              </div>

              <div
                style={{
                  marginTop: "18px",
                  color: "#059669",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                ENTER PANEL →
              </div>
            </button>

            {/* USER */}
            <button
              onClick={() => setRole("user")}
              style={{
                padding: "26px 22px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.94)",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 18px 35px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(0,0,0,0.15)";
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "15px",
                  background: "#fff7ed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "16px"
                }}
              >
                🛍️
              </div>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#111827"
                }}
              >
                User
              </div>

              <div
                style={{
                  color: "#64748b",
                  marginTop: "7px",
                  fontSize: "13px",
                  lineHeight: "1.5"
                }}
              >
                Browse products and shop your favorites.
              </div>

              <div
                style={{
                  marginTop: "18px",
                  color: "#ea580c",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                START SHOPPING →
              </div>
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px"
            }}
          >
            Smart • Simple • Connected
          </div>
        </div>
      </div>
    );
  }

  // USER
  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        role={role}
        onBack={() => setRole(null)}
      />
    );
  }

  if (role === "user") {
    return (
      <UserDashboard
        account={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div>
      <nav
        style={{
          height: "70px",
          padding: "0 35px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          color: "#111827",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          boxSizing: "border-box"
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "800"
            }}
          >
            {role === "admin" ? "Admin Panel" : "Employee Panel"}
          </h2>

          <span
            style={{
              fontSize: "12px",
              color: "#374151",
              fontWeight: "600"
            }}
          >
            {role === "admin"
              ? "Management Dashboard"
              : "Attendance Management"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px"
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "700" }}>
              {user.username}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#16a34a",
                fontWeight: "600"
              }}
            >
              {role === "admin" ? "Admin" : "Employee"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "9px 16px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              background: "#f1f5f9",
              color: "#111827",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {role === "admin" ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard accountId={user.id} />
      )}
    </div>
  );
}

export default App;