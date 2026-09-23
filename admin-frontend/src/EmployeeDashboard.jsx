import { useCallback, useEffect, useState } from "react";
import Chat from "./Chat";

const API_URL = "http://localhost:3000";

function EmployeeDashboard({ accountId }) {
  const [attendance, setAttendance] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    image_url: "",
    details: ""
  });

  const loadAttendance = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance?account_id=${accountId}`,
        {
          credentials: "include"
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : {};
        setAttendance(data.attendance || data);
      }
    } catch {
      setMessage("Unable to load attendance");
    }
  }, [accountId]);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products`);

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data);
      }
    } catch {
      setMessage("Unable to load products");
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([loadAttendance(), loadProducts()]);
    };

    void loadInitialData();
  }, [loadAttendance, loadProducts]);

  const markAttendance = async (status) => {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          account_id: accountId,
          date: new Date().toISOString().split("T")[0],
          status
        })
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        setMessage(data.message || "Attendance update failed");
        return;
      }

      setMessage("Attendance updated successfully");
      loadAttendance();
    } catch {
      setMessage("Unable to connect to backend");
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todaysAttendance = attendance.find(
    (item) => String(item.date).slice(0, 10) === today
  );

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetProductForm = (closeForm = true) => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      stock: "",
      image_url: "",
      details: ""
    });

    setEditingProduct(null);
    setShowProductForm(closeForm ? false : true);
  };

  const openAddProduct = () => {
    setEditingProduct(null);

    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      stock: "",
      image_url: "",
      details: ""
    });

    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      brand: product.brand || "",
      stock: product.stock ?? "",
      image_url: product.image_url || "",
      details: product.details || ""
    });

    setShowProductForm(true);
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    try {
      const url = editingProduct
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          category: productForm.category,
          brand: productForm.brand,
          stock: Number(productForm.stock || 0),
          image_url: productForm.image_url,
          details: productForm.details
        })
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        setMessage(
          response.status === 401 || response.status === 403
            ? "Your employee session has expired. Please log in again."
            : data.message || "Unable to save product"
        );
        return;
      }

      setMessage(
        editingProduct
          ? "Product updated successfully"
          : "Product added successfully"
      );

      resetProductForm(false);
      loadProducts();
    } catch {
      setMessage("Unable to connect to backend");
    }
  };

  const deleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete product");
        return;
      }

      setMessage("Product deleted successfully");
      loadProducts();
    } catch {
      setMessage("Unable to connect to backend");
    }
  };

  return (
    <div
      className="employee-dashboard-page"
      style={{
        minHeight: "calc(100vh - 70px)",
        backgroundImage:
          "linear-gradient(120deg, rgba(15,23,42,0.84), rgba(30,41,59,0.72)), url('https://thumbs.dreamstime.com/b/seamless-electronic-products-background-19840269.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        padding: "35px"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.94)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "25px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}
        >
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "30px"
            }}
          >
            Employee Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280"
            }}
          >
            Manage your attendance and products.
          </p>
        </div>

        {message && (
          <div
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "600"
            }}
          >
            {message}
          </div>
        )}

        <Chat role="employee" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px"
          }}
        >
          {/* ATTENDANCE */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "25px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
            }}
          >
            <h2>My Attendance</h2>

            <p
              style={{
                color: "#6b7280"
              }}
            >
              {todaysAttendance
                ? `Today's status: ${todaysAttendance.status}`
                : "Mark your attendance for today."}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px"
              }}
            >
              <button
                onClick={() => markAttendance("present")}
                disabled={Boolean(todaysAttendance)}
                style={{
                  padding: "11px 20px",
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Present
              </button>

              <button
                onClick={() => markAttendance("absent")}
                disabled={Boolean(todaysAttendance)}
                style={{
                  padding: "11px 20px",
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Absent
              </button>
            </div>

            <div
              style={{
                marginTop: "25px"
              }}
            >
              {attendance.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  No attendance records found.
                </p>
              ) : (
                attendance.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #e5e7eb"
                    }}
                  >
                    <span>
                      {new Date(item.date).toLocaleDateString()}
                    </span>

                    <strong
                      style={{
                        color:
                          item.status === "present"
                            ? "#16a34a"
                            : "#dc2626"
                      }}
                    >
                      {item.status}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PRODUCT MANAGEMENT */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "25px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <h2
                style={{
                  margin: 0
                }}
              >
                Product Management
              </h2>

              <button
                onClick={openAddProduct}
                style={{
                  padding: "10px 15px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                + Add Product
              </button>
            </div>

            <p
              style={{
                color: "#6b7280"
              }}
            >
              Add, update or delete products.
            </p>

            {showProductForm && (
              <form
                onSubmit={saveProduct}
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <h3
                  style={{
                    marginTop: 0
                  }}
                >
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h3>

                <input
                  name="name"
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  required
                  style={inputStyle}
                />

                <input
                  name="brand"
                  placeholder="Brand"
                  value={productForm.brand}
                  onChange={handleProductChange}
                  style={inputStyle}
                />

                <input
                  name="category"
                  placeholder="Category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  style={inputStyle}
                />

                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={handleProductChange}
                  required
                  style={inputStyle}
                />

                <input
                  name="stock"
                  type="number"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={handleProductChange}
                  style={inputStyle}
                />

                <input
                  name="image_url"
                  placeholder="Product image URL"
                  value={productForm.image_url}
                  onChange={handleProductChange}
                  style={inputStyle}
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows="3"
                  style={{
                    ...inputStyle,
                    resize: "vertical"
                  }}
                />

                <textarea
                  name="details"
                  placeholder="Product details"
                  value={productForm.details}
                  onChange={handleProductChange}
                  rows="3"
                  style={{
                    ...inputStyle,
                    resize: "vertical"
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px"
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      padding: "11px 18px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    {editingProduct
                      ? "Update Product"
                      : "Save Product"}
                  </button>

                  <button
                    type="button"
                    onClick={resetProductForm}
                    style={{
                      padding: "11px 18px",
                      background: "#64748b",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div
              style={{
                marginTop: "20px",
                maxHeight: "500px",
                overflowY: "auto"
              }}
            >
              {products.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  No products available.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      padding: "15px 0",
                      borderBottom: "1px solid #e5e7eb"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "15px"
                      }}
                    >
                      <div>
                        <strong>{product.name}</strong>

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            marginTop: "5px"
                          }}
                        >
                          {product.brand || "No brand"} · Stock:{" "}
                          {product.stock}
                        </div>

                        <div
                          style={{
                            marginTop: "5px",
                            fontWeight: "700"
                          }}
                        >
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString()}
                        </div>
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
                            openEditProduct(product)
                          }
                          style={{
                            padding: "8px 12px",
                            background: "#f59e0b",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "7px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                          style={{
                            padding: "8px 12px",
                            background: "#dc2626",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "7px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  marginBottom: "12px",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  background: "#ffffff",
  color: "#111827"
};

export default EmployeeDashboard;