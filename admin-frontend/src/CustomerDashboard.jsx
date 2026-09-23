import { useState } from "react";
import Products from "./Products";
import Cart from "./Cart";
import CustomerDetails from "./CustomerDetails";
import Chat from "./Chat";

function CustomerDashboard({ account, onLogout }) {
  const [customer, setCustomer] = useState(() => {
    if (account) {
      return {
        name: account.username,
        email: account.email,
        phone: ""
      };
    }

    const savedCustomer = localStorage.getItem("customerDetails");
    return savedCustomer ? JSON.parse(savedCustomer) : null;
  });
  const [page, setPage] = useState("products");
  const [cartCount, setCartCount] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]").reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    )
  );

  const handleCustomerContinue = (customerData) => {
    setCustomer(customerData);
  };

  const handleLogout = () => {
    localStorage.removeItem("customerDetails");
    setCustomer(null);
    setPage("products");
    onLogout?.();
  };

  if (!customer) {
    return (
      <CustomerDetails
        onContinue={handleCustomerContinue}
      />
    );
  }

  return (
    <div
      className="store-shell user-store-page"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#111827"
      }}
    >
      <nav
        className="store-nav"
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 35px",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div
          className="store-nav-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}
        >
          <button
            onClick={() => setPage("products")}
            style={{
              border: "none",
              background: "transparent",
              fontWeight: page === "products" ? "800" : "600",
              color: page === "products" ? "#2563eb" : "#374151",
              cursor: "pointer"
            }}
          >
            Products
          </button>

          <button
            onClick={() => setPage("cart")}
            style={{
              border: "none",
              background: "transparent",
              fontWeight: page === "cart" ? "800" : "600",
              color: page === "cart" ? "#2563eb" : "#374151",
              cursor: "pointer"
            }}
          >
            Cart
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>

          <button
            onClick={() => setPage("chat")}
            style={{
              border: "none",
              background: "transparent",
              fontWeight: page === "chat" ? "800" : "600",
              color: page === "chat" ? "#2563eb" : "#374151",
              cursor: "pointer"
            }}
          >
            Chat
          </button>

          <div
            style={{
              borderLeft: "1px solid #e5e7eb",
              paddingLeft: "20px"
            }}
          >
            <div
              style={{
                fontWeight: "700",
                fontSize: "14px"
              }}
            >
              {customer.name}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#6b7280"
              }}
            >
              {customer.phone}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "9px 15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#374151",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {page === "products" && <Products />}

      {page === "cart" && (
        <Cart
          onBackToProducts={() => setPage("products")}
          onCartChange={setCartCount}
        />
      )}

      {page === "chat" && (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px" }}>
          <Chat role="user" accountId={account?.id} />
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;