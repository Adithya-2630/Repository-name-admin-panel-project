import { useState } from "react";

function CustomerDetails({ onContinue }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in all the details.");
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const customer = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim()
    };

    localStorage.setItem(
      "customerDetails",
      JSON.stringify(customer)
    );

    setError("");

    if (onContinue) {
      onContinue(customer);
    }
  };

  return (
    <div
      className="auth-page customer-entry-page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        boxSizing: "border-box"
      }}
    >
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          boxSizing: "border-box",
          boxShadow:
            "0 15px 40px rgba(15, 23, 42, 0.12)"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px"
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px"
            }}
          >
            🛍️
          </div>

          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "28px"
            }}
          >
            Welcome
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "10px",
              lineHeight: "1.5"
            }}
          >
            Enter your details to continue shopping.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
              color: "#374151"
            }}
          >
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "18px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              boxSizing: "border-box",
              fontSize: "15px",
              outline: "none"
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
            Mobile Number
          </label>

          <input
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            maxLength="10"
            onChange={(event) =>
              setPhone(
                event.target.value.replace(/\D/g, "")
              )
            }
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "18px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              boxSizing: "border-box",
              fontSize: "15px",
              outline: "none"
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
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "20px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              boxSizing: "border-box",
              fontSize: "15px",
              outline: "none"
            }}
          />

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "12px",
                borderRadius: "9px",
                marginBottom: "18px",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#111827",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "800",
              cursor: "pointer"
            }}
          >
            Continue Shopping →
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            marginBottom: 0,
            fontSize: "12px",
            color: "#94a3b8"
          }}
        >
          Your details will be used for your shopping
          order.
        </p>
      </div>
    </div>
  );
}

export default CustomerDetails;