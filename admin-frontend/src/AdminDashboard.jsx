import { useEffect, useState } from "react";
import {
  getAdminProductImage
} from "./adminCatalog";
import Chat from "./Chat";

const API_URL = "http://localhost:3000";

function AdminDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeUsername, setEmployeeUsername] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productBrandFilter, setProductBrandFilter] = useState("all");
  const [productSort, setProductSort] = useState("name");

  const [message, setMessage] = useState("");

  const loadAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        credentials: "include"
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (response.ok) {
        setAccounts(data.accounts || []);
      } else {
        setMessage(data.message || "Failed to load accounts");
      }
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setMessage(data.message || "Failed to load products");
      }
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([loadAccounts(), loadProducts()]);
    };

    void loadInitialData();
  }, []);

  const createAccount = async (event) => {
    event.preventDefault();

    setMessage("Creating account...");

    try {
      const response = await fetch(`${API_URL}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
          role: "employee"
        })
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        setMessage(data.message || "Failed to create account");
        return;
      }

      setMessage("Employee account created successfully");

      setUsername("");
      setEmail("");
      setPassword("");

      loadAccounts();
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const deleteAccount = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/accounts/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Account deleted successfully");
        loadAccounts();
      } else {
        setMessage(data.message || "Failed to delete account");
      }
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const changeStatus = async (id, action) => {
    try {
      const response = await fetch(
        `${API_URL}/accounts/${id}/${action}`,
        {
          method: "PUT",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        loadAccounts();
      } else {
        setMessage(data.message || "Failed to update account");
      }
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const changeTopUpAccess = async (account) => {
    try {
      const response = await fetch(
        `${API_URL}/accounts/${account.id}/top-up-access`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            can_add_money: !account.can_add_money
          })
        }
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        loadAccounts();
      } else {
        setMessage(data.message || "Failed to update wallet permission");
      }
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const editEmployee = (account) => {
    setEditingEmployee(account);
    setEmployeeUsername(account.username || "");
    setEmployeePassword("");
    setMessage("");
  };

  const cancelEmployeeEdit = () => {
    setEditingEmployee(null);
    setEmployeeUsername("");
    setEmployeePassword("");
  };

  const updateEmployee = async (event) => {
    event.preventDefault();
    setMessage("Updating employee credentials...");

    try {
      const response = await fetch(
        `${API_URL}/accounts/${editingEmployee.id}/credentials`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            username: employeeUsername,
            password: employeePassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update employee credentials");
        return;
      }

      setMessage("Employee credentials updated successfully");
      cancelEmployeeEdit();
      loadAccounts();
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();

    setMessage(editingProduct ? "Updating product..." : "Adding product...");

    try {
      const response = await fetch(
        editingProduct
          ? `${API_URL}/products/${editingProduct.id}`
          : `${API_URL}/products`,
        {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          price: Number(productPrice),
          category: productCategory,
          brand: productBrand,
          stock: Number(productStock),
          image_url: productImage,
          details: productDetails
        })
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        setMessage(
          response.status === 401 || response.status === 403
            ? "Your admin session has expired. Please log in again."
            : data.message || "Failed to add product"
        );
        return;
      }

      setMessage(
        editingProduct
          ? "Product updated successfully"
          : "Product added successfully"
      );

      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductCategory("");
      setProductBrand("");
      setProductStock("");
      setProductImage("");
      setProductDetails("");
      setEditingProduct(null);

      loadProducts();
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductName(product.name || "");
    setProductDescription(product.description || "");
    setProductPrice(product.price ?? "");
    setProductCategory(product.category || "");
    setProductBrand(product.brand || "");
    setProductStock(product.stock ?? "");
    setProductImage(product.image_url || "");
    setProductDetails(product.details || "");
  };

  const cancelProductEdit = () => {
    setEditingProduct(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategory("");
    setProductBrand("");
    setProductStock("");
    setProductImage("");
    setProductDetails("");
  };

  const deleteProduct = async (productId) => {
    if (productId < 1) {
      setMessage("This demo product is not stored in the database");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : {};

      if (!response.ok) {
        setMessage(
          data.message ||
            "The product could not be deleted. Please refresh and try again."
        );
        return;
      }

      setMessage("Product deleted successfully");
      loadProducts();
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  const activeAccounts = accounts.filter(
    (account) => account.status === "active"
  ).length;

  const inactiveAccounts = accounts.filter(
    (account) => account.status === "inactive"
  ).length;
  const lowStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= 5
  ).length;
  const sortedAccounts = [...accounts].sort((first, second) => {
    if (first.role === second.role) {
      return String(first.username || "").localeCompare(
        String(second.username || "")
      );
    }

    return first.role === "employee" ? -1 : 1;
  });

  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    )
  ].sort();

  const brands = [
    ...new Set(
      products
        .map((product) => product.brand)
        .filter(Boolean)
    )
  ].sort();

  const visibleProducts = products
    .filter((product) => {
      const search = productSearch.trim().toLowerCase();
      const matchesSearch =
        !search ||
        [product.name, product.brand, product.category]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          );
      const matchesCategory =
        productCategoryFilter === "all" ||
        product.category === productCategoryFilter;
      const matchesBrand =
        productBrandFilter === "all" ||
        product.brand === productBrandFilter;

      return matchesSearch && matchesCategory && matchesBrand;
    })
    .sort((first, second) => {
      if (productSort === "price-low") {
        return Number(first.price || 0) - Number(second.price || 0);
      }

      if (productSort === "price-high") {
        return Number(second.price || 0) - Number(first.price || 0);
      }

      return String(first.name || "").localeCompare(
        String(second.name || "")
      );
    });

  const employeeAccounts = sortedAccounts.filter(
    (account) => account.role === "employee"
  );
  const userAccounts = sortedAccounts.filter(
    (account) => account.role === "user"
  );

  const renderAccount = (account) => (
    <div
      key={account.id}
      style={{
        padding: "16px 0",
        borderBottom: "1px solid #e2e8f0"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <strong style={{ color: "#111827", fontSize: "16px" }}>
            {account.username}
          </strong>
          <span
            style={{
              display: "inline-block",
              marginLeft: "8px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: account.role === "employee" ? "#dbeafe" : "#dcfce7",
              color: account.role === "employee" ? "#1d4ed8" : "#166534",
              fontSize: "11px",
              fontWeight: "800",
              textTransform: "uppercase"
            }}
          >
            {account.role}
          </span>
          <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            {account.email}
          </div>
          {account.role === "user" && (
            <>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                {account.full_name || "Name not provided"} ·{" "}
                {account.phone || "Phone not provided"}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                Add-money access: {account.can_add_money ? "Allowed" : "Not allowed"}
              </div>
            </>
          )}
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: account.status === "active" ? "#16a34a" : "#dc2626",
              marginTop: "4px"
            }}
          >
            {account.status}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {account.role === "employee" && (
            <button onClick={() => editEmployee(account)} style={secondaryButton}>
              Edit ID / Password
            </button>
          )}
          {account.role === "user" && (
            <button
              onClick={() => changeTopUpAccess(account)}
              style={account.can_add_money ? warningButton : successButton}
            >
              {account.can_add_money ? "Revoke Add-Money Access" : "Allow Add-Money Access"}
            </button>
          )}
          <button
            onClick={() =>
              changeStatus(
                account.id,
                account.status === "active" ? "deactivate" : "activate"
              )
            }
            style={account.status === "active" ? warningButton : successButton}
          >
            {account.status === "active" ? "Deactivate" : "Activate"}
          </button>
          <button onClick={() => deleteAccount(account.id)} style={dangerButton}>
            Delete
          </button>
        </div>
      </div>

      {editingEmployee?.id === account.id && (
        <form
          onSubmit={updateEmployee}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "8px",
            marginTop: "12px"
          }}
        >
          <input
            value={employeeUsername}
            onChange={(event) => setEmployeeUsername(event.target.value)}
            placeholder="New employee ID"
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={employeePassword}
            onChange={(event) => setEmployeePassword(event.target.value)}
            placeholder="New password (optional)"
            style={inputStyle}
          />
          <button type="submit" style={primaryButton}>Save Credentials</button>
          <button type="button" onClick={cancelEmployeeEdit} style={secondaryButton}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div
      className="admin-dashboard-page"
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "40px 30px",
        boxSizing: "border-box",
        position: "relative",
        backgroundImage:
  "linear-gradient(rgba(5, 10, 25, 0.72), rgba(8, 15, 35, 0.84)), url('https://thumbs.dreamstime.com/b/seamless-electronic-products-background-19840269.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, #4f46e5, #06b6d4, #22c55e)"
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            marginBottom: "30px",
            padding: "28px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
          }}
        >
          <div
            style={{
              color: "#93c5fd",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "2px",
              marginBottom: "8px"
            }}
          >
            MANAGEMENT CONSOLE
          </div>

          <h1
            style={{
              color: "white",
              margin: "0 0 8px",
              fontSize: "42px",
              fontWeight: "800"
            }}
          >
            Admin Dashboard
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              margin: 0,
              fontSize: "16px"
            }}
          >
            Manage accounts, products and store operations.
          </p>
        </div>

        {message && (
          <div
            style={{
              background: "rgba(220,252,231,0.96)",
              color: "#166534",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "600",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
            }}
          >
            {message}
          </div>
        )}

        <Chat role="admin" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "30px"
          }}
        >
          <div style={statCard}>
            <div style={statIcon}>👥</div>
            <p style={statLabel}>Total Accounts</p>
            <h2 style={statNumber}>
              {accounts.length}
            </h2>
          </div>

          <div
            style={{
              ...statCard,
              background: "rgba(240,253,244,0.95)"
            }}
          >
            <div style={statIcon}>✓</div>
            <p style={statLabel}>Active</p>
            <h2
              style={{
                ...statNumber,
                color: "#16a34a"
              }}
            >
              {activeAccounts}
            </h2>
          </div>

          <div
            style={{
              ...statCard,
              background: "rgba(254,242,242,0.95)"
            }}
          >
            <div style={statIcon}>⏸</div>
            <p style={statLabel}>Inactive</p>
            <h2
              style={{
                ...statNumber,
                color: "#dc2626"
              }}
            >
              {inactiveAccounts}
            </h2>
          </div>

          <div
            style={{
              ...statCard,
              background: "rgba(239,246,255,0.95)"
            }}
          >
            <div style={statIcon}>📦</div>
            <p style={statLabel}>Total Products</p>
            <h2
              style={{
                ...statNumber,
                color: "#2563eb"
              }}
            >
              {products.length}
            </h2>
          </div>

          <div
            style={{
              ...statCard,
              background: "rgba(255,247,237,0.95)"
            }}
          >
            <div style={statIcon}>⚠</div>
            <p style={statLabel}>Low Stock</p>
            <h2 style={{ ...statNumber, color: "#ea580c" }}>
              {lowStockProducts}
            </h2>
          </div>
        </div>

        <div style={sectionCard}>
          <h2 style={sectionTitle}>
            👤 Create Employee Account
          </h2>

          <p style={sectionDescription}>
            Create an employee account for attendance access.
          </p>

          <form
            onSubmit={createAccount}
            style={{
              display: "grid",
              gap: "12px"
            }}
          >
            <input
              placeholder="Employee ID"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              style={inputStyle}
            />

            <button
              type="submit"
              style={primaryButton}
            >
              Create Employee
            </button>
          </form>
        </div>

        <div style={sectionCard}>
          <h2 style={sectionTitle}>
            👥 Accounts
          </h2>

          {accounts.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              No accounts available.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "24px",
                alignItems: "start"
              }}
            >
              <div>
                <h3 style={accountGroupTitle}>👷 Employees</h3>
                {employeeAccounts.length === 0 ? (
                  <p style={{ color: "#64748b" }}>No employee accounts.</p>
                ) : (
                  employeeAccounts.map(renderAccount)
                )}
              </div>
              <div>
                <h3 style={accountGroupTitle}>👤 Users</h3>
                {userAccounts.length === 0 ? (
                  <p style={{ color: "#64748b" }}>No user accounts.</p>
                ) : (
                  userAccounts.map(renderAccount)
                )}
              </div>
            </div>
          )}
        </div>

        <div style={sectionCard}>
          <h2 style={sectionTitle}>
            📦 Add Product
          </h2>

          <p style={sectionDescription}>
            Add products that will appear in the User store.
          </p>

          <form
            onSubmit={createProduct}
            style={{
              display: "grid",
              gap: "12px"
            }}
          >
            <input
              placeholder="Product Name"
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
              required
              style={inputStyle}
            />

            <textarea
              placeholder="Product Description"
              value={productDescription}
              onChange={(event) =>
                setProductDescription(
                  event.target.value
                )
              }
              rows="3"
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Price"
              value={productPrice}
              onChange={(event) =>
                setProductPrice(event.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              placeholder="Category"
              value={productCategory}
              onChange={(event) =>
                setProductCategory(
                  event.target.value
                )
              }
              style={inputStyle}
            />

            <input
              placeholder="Brand"
              value={productBrand}
              onChange={(event) =>
                setProductBrand(event.target.value)
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Stock"
              value={productStock}
              onChange={(event) =>
                setProductStock(event.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              placeholder="Image URL"
              value={productImage}
              onChange={(event) =>
                setProductImage(event.target.value)
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Product Details"
              value={productDetails}
              onChange={(event) =>
                setProductDetails(event.target.value)
              }
              rows="4"
              style={inputStyle}
            />

            <button
              type="submit"
              style={primaryButton}
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={cancelProductEdit}
                  style={secondaryButton}
                >
                  Cancel Edit
                </button>
              )}
          </form>
        </div>

        <div style={sectionCard}>
          <h2 style={sectionTitle}>
            🛍️ Products
          </h2>

          <div className="admin-product-filters">
            <input
              value={productSearch}
              onChange={(event) =>
                setProductSearch(event.target.value)
              }
              placeholder="Search by name, brand, or category"
              style={inputStyle}
            />

            <select
              value={productCategoryFilter}
              onChange={(event) =>
                setProductCategoryFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={productBrandFilter}
              onChange={(event) =>
                setProductBrandFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option value="all">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <select
              value={productSort}
              onChange={(event) => setProductSort(event.target.value)}
              style={inputStyle}
            >
              <option value="name">Sort: Name</option>
              <option value="price-low">Sort: Price low to high</option>
              <option value="price-high">Sort: Price high to low</option>
            </select>
          </div>

          <p className="admin-product-count">
            Showing {visibleProducts.length} of {products.length} products
          </p>

          {visibleProducts.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              {products.length === 0
                ? "No products added yet."
                : "No products match these filters."}
            </p>
          ) : (
            visibleProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr auto",
                  alignItems: "start",
                  gap: "16px",
                  padding: "18px 0",
                  borderBottom:
                    "1px solid #e2e8f0"
                }}
              >
                <img
                  src={getAdminProductImage(product)}
                  alt=""
                  style={{
                    width: "72px",
                    height: "72px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    background: "#eef2ff",
                    border: "1px solid #e2e8f0"
                  }}
                />

                <div>
                  <h3
                    style={{
                      color: "#111827",
                      margin: "0 0 8px"
                    }}
                  >
                    {product.name}
                  </h3>

                  <p style={{ color: "#64748b" }}>
                    {product.description}
                  </p>

                  <p>
                    <strong>Brand:</strong>{" "}
                    {product.brand}
                  </p>

                  <p>
                    <strong>Category:</strong>{" "}
                    {product.category}
                  </p>

                  <p>
                    <strong>Price:</strong> ₹
                    {Number(product.price || 0).toLocaleString("en-IN")}
                  </p>

                  <p>
                    <strong>Stock:</strong>{" "}
                    {product.stock}
                  </p>

                  <p style={{ color: "#475569" }}>
                    {product.details}
                  </p>
                </div>
                <div className="product-actions">
                  <button
                    type="button"
                    onClick={() => editProduct(product)}
                    style={secondaryButton}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    style={dangerButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const sectionCard = {
  background: "rgba(255,255,255,0.96)",
  padding: "25px",
  borderRadius: "16px",
  marginBottom: "30px",
  boxShadow: "0 12px 35px rgba(0,0,0,0.16)",
  border: "1px solid rgba(255,255,255,0.5)"
};

const sectionTitle = {
  color: "#111827",
  margin: "0 0 6px"
};

const sectionDescription = {
  color: "#64748b",
  marginTop: 0,
  marginBottom: "18px"
};

const accountGroupTitle = {
  margin: "0 0 4px",
  paddingBottom: "10px",
  borderBottom: "2px solid #cbd5e1",
  color: "#1e3a8a"
};

const statCard = {
  background: "rgba(255,255,255,0.95)",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
};

const statIcon = {
  fontSize: "24px",
  marginBottom: "8px"
};

const statLabel = {
  color: "#64748b",
  margin: "0 0 4px",
  fontSize: "14px",
  fontWeight: "600"
};

const statNumber = {
  color: "#111827",
  margin: 0,
  fontSize: "30px"
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  boxSizing: "border-box",
  width: "100%",
  background: "white",
  color: "#111827"
};

const primaryButton = {
  padding: "12px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
};

const secondaryButton = {
  padding: "10px 15px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#334155",
  fontWeight: "700",
  cursor: "pointer"
};

const dangerButton = {
  padding: "8px 14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer"
};

const warningButton = {
  padding: "8px 14px",
  background: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer"
};

const successButton = {
  padding: "8px 14px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer"
};

export default AdminDashboard;