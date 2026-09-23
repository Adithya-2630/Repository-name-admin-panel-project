import { useEffect, useState } from "react";
import { getAdminProductImage } from "./adminCatalog";

function Cart({ onBackToProducts, onCartChange }) {
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  const [walletBalance, setWalletBalance] = useState(null);
  const [canAddMoney, setCanAddMoney] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [addingMoney, setAddingMoney] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const removeUnavailableProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/products");
        const data = await response.json();
        const availableIds = new Set(
          (data.products || []).map((product) => product.id)
        );
        const validCart = cart.filter((item) => availableIds.has(item.id));

        if (validCart.length !== cart.length) {
          setCart(validCart);
          localStorage.setItem("cart", JSON.stringify(validCart));
          onCartChange?.(
            validCart.reduce(
              (count, item) => count + Number(item.quantity || 0),
              0
            )
          );
          setMessage(
            "Unavailable demo products were removed from your cart. Add products from the store to checkout."
          );
        }
      } catch {
        setMessage("Unable to verify cart products with the backend");
      }
    };

    void removeUnavailableProducts();
  }, [cart, onCartChange]);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await fetch("http://localhost:3000/wallet", {
          credentials: "include"
        });
        const data = await response.json();

        if (response.ok) {
          setWalletBalance(data.wallet.balance);
          setCanAddMoney(data.canAddMoney === true);
        }
      } catch {
        setWalletBalance(null);
      }
    };

    void loadWallet();
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
    onCartChange?.(updatedCart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ));
  };

  const updateQuantity = (id, change) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + change
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
    onCartChange?.(updatedCart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ));
  };

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const addMoney = async (event) => {
    event.preventDefault();
    const amount = Number(topUpAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid amount to add");
      return;
    }

    setAddingMoney(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/wallet/add-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ amount })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add money");
        return;
      }

      setWalletBalance(data.wallet.balance);
      setTopUpAmount("");
      setMessage(data.message);
    } catch {
      setMessage("Unable to connect to the wallet service");
    } finally {
      setAddingMoney(false);
    }
  };

  const checkout = async () => {
    if (!window.confirm("Checkout with these items?")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/wallet/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Checkout failed");
        return;
      }

      localStorage.removeItem("cart");
      setCart([]);
      onCartChange?.(0);
      setWalletBalance(data.wallet.balance);
      setMessage(
        `Purchase complete. ₹${Number(data.total).toLocaleString("en-IN")} deducted.`
      );
    } catch {
      setMessage("Unable to connect to the wallet service");
    }
  };

  return (
    <div
      className="cart-page"
      style={{
        padding: "30px",
        background: "#f8fafc",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        <div className="cart-heading">
          <button
            onClick={onBackToProducts}
            className="back-to-products"
            type="button"
          >
            ← Back to products
          </button>
          <h1>Shopping Cart</h1>
        </div>

        <div className="wallet-summary">
          <span>Wallet balance</span>
          <strong>
            {walletBalance === null
              ? "Log in to view"
              : `₹${Number(walletBalance).toLocaleString("en-IN")}`}
          </strong>
        </div>

        {canAddMoney ? (
          <form
            onSubmit={addMoney}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              margin: "12px 0 20px"
            }}
          >
            <input
              type="number"
              min="1"
              max="1000000"
              step="0.01"
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(event.target.value)}
              placeholder="Amount to add"
              aria-label="Amount to add to wallet"
              style={{
                flex: "1 1 180px",
                padding: "11px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px"
              }}
            />
            <button
              type="submit"
              disabled={addingMoney}
              style={{
                padding: "11px 18px",
                border: "none",
                borderRadius: "8px",
                background: "#16a34a",
                color: "white",
                fontWeight: "700",
                cursor: addingMoney ? "not-allowed" : "pointer"
              }}
            >
              {addingMoney ? "Adding..." : "Add Money"}
            </button>
          </form>
        ) : (
          <p style={{ color: "#64748b", margin: "12px 0 20px" }}>
            Wallet top-ups are available only after admin approval.
          </p>
        )}

        {message && <div className="cart-message">{message}</div>}

        {cart.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center"
            }}
          >
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart.</p>
          </div>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "white",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px"
                }}
              >
                <img
                  src={getAdminProductImage(item)}
                  alt=""
                  className="cart-item-image"
                />

                <div className="cart-item-info">
                  <h2 style={{ margin: "0 0 8px" }}>
                    {item.name}
                  </h2>

                  <p style={{ margin: "5px 0" }}>
                    ₹{item.price}
                  </p>

                  <p style={{ margin: "5px 0" }}>
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center"
                  }}
                >
                  <button
                    onClick={() =>
                      updateQuantity(item.id, -1)
                    }
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer"
                    }}
                  >
                    −
                  </button>

                  <span
                    style={{
                      fontWeight: "700"
                    }}
                  >
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, 1)
                    }
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    style={{
                      padding: "8px 12px",
                      marginLeft: "10px",
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "right"
              }}
            >
              <h2>
                Total: ₹{total.toLocaleString()}
              </h2>

              <button
                onClick={checkout}
                style={{
                  padding: "12px 25px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;