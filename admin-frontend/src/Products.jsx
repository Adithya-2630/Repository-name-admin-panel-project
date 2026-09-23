import { useCallback, useEffect, useState } from "react";



const API_URL = "http://localhost:3000";



function getProductImage(product) {
  const providedImage = product.image_url || product.image;

  if (providedImage?.trim()) {
    return providedImage.trim();
  }

  const text = `${product.name || ""} ${product.brand || ""} ${
    product.category || ""
  }`.toLowerCase();



  // iPhone

  if (text.includes("iphone")) {

    return "https://images.unsplash.com/photo-1592286927505-2fd0e4f4b2e5?auto=format&fit=crop&w=900&q=90";

  }



  // Laptops

  if (text.includes("dell") && text.includes("laptop")) {
  return "https://www.dell.com/wp-uploads/2025/06/2602g0011-gl-cs-co-site-banner-da14250t-da16250t-1024x768-1280x1280-1.jpeg";
}

if (
  text.includes("macbook") ||
  text.includes("laptop") ||
  text.includes("computer")
) {
  return "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-specs-select-202601-13inch-midnight?wid=5120&hei=3280&fmt=webp&qlt=90&.v=ajdLenRnamROTGJtUHRvOGZlUzI4MU0yT2lzdkN4K05EeWJacEtORTNwZTVFT3l4YzdjbU9SNjRscVJWQjRYMUVlNEJLYXlpcWN3dVUzSHNPQldJNDUyTGQvczVjTzVnd1B6UVQwaE1kY2lrL0ZaT3RUUHBnLzlIcmhSeFQ5UVZyTEhqaFJlNk5MelQyK0xzSUliR3h3&traceId=1";
}



  // Samsung phones

  if (

    text.includes("samsung") &&

    (text.includes("galaxy s") || text.includes("smartphone"))

  ) {

    return "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=90";

  }



  // Other smartphones

  if (

    text.includes("phone") ||

    text.includes("mobile") ||

    text.includes("smartphone")

  ) {

    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=90";

  }



  // Sony Headphones

  if (text.includes("headphone")) {

    return "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=90";

  }



  // AirPods / Earbuds

  if (

    text.includes("airpods") ||

    text.includes("earbuds") ||

    text.includes("earphone")

  ) {

    return "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=90";

  }



  // iPad / Tablet

  if (text.includes("ipad") || text.includes("tablet")) {

    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=90";

  }



  // Smartwatch

  if (text.includes("watch") || text.includes("smartwatch")) {

    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=90";

  }



  // Camera

  if (

    text.includes("camera") ||

    text.includes("canon") ||

    text.includes("nikon")

  ) {

    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=90";

  }



  // TV

  if (

    text.includes("tv") ||

    text.includes("television") ||

    text.includes("bravia")

  ) {

    return "https://shopatsc.com/cdn/shop/files/B0GZG99HL7.PT01.jpg?v=1779449488";

  }



  // JBL Speaker

  if (text.includes("jbl")) {

    return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=90";

  }



  // Amazon Echo

  if (

    text.includes("echo") ||

    text.includes("amazon")

  ) {

    return "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=900&q=90";

  }



  // PlayStation / Gaming

  if (

    text.includes("playstation") ||

    text.includes("gaming") ||

    text.includes("console") ||

    text.includes("xbox")

  ) {

    return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=90";

  }



  // PlayStation Controller

  if (

    text.includes("controller") ||

    text.includes("gaming accessory")

  ) {

    return "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=900&q=90";

  }



  // Monitor

  if (

    text.includes("monitor") ||

    text.includes("display")

  ) {

    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl7BC3byf6j7wtyIvN-6aN6hYIWDuPwXpYQdB6W3ACmQ&s=10";

  }



  // Keyboard

  if (text.includes("keyboard")) {

    return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=90";

  }



  // Mouse

  if (text.includes("mouse")) {

    return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=90";

  }



  // Printer

  if (text.includes("printer")) {

    return "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=90";

  }



  // Fallback

  return (

    product.image_url ||
    product.image ||

    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=900&q=90"

  );

}

function Product({ product, onAddToCart }) {

  if (!product) {

    return null;

  }



  const image = getProductImage(product);

  const stock = Number(product.stock || 0);

  const outOfStock = stock <= 0;



  return (

    <div
      className="store-content products-page"
      style={{

        background: "white",

        borderRadius: "20px",

        overflow: "hidden",

        border: "1px solid #e5e7eb",

        boxShadow: "0 8px 25px rgba(15,23,42,0.08)",

        transition: "transform 0.2s ease, box-shadow 0.2s ease"

      }}

      onMouseEnter={(event) => {

        event.currentTarget.style.transform = "translateY(-5px)";

        event.currentTarget.style.boxShadow =

          "0 18px 35px rgba(15,23,42,0.15)";

      }}

      onMouseLeave={(event) => {

        event.currentTarget.style.transform = "translateY(0)";

        event.currentTarget.style.boxShadow =

          "0 8px 25px rgba(15,23,42,0.08)";

      }}

    >

      <div

        style={{

          height: "260px",

          background:

            "linear-gradient(145deg, #f8fafc, #eef2ff)",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          overflow: "hidden",

          position: "relative"

        }}

      >

        <div

          style={{

            position: "absolute",

            top: "15px",

            left: "15px",

            zIndex: 2,

            background: "#111827",

            color: "white",

            padding: "6px 12px",

            borderRadius: "20px",

            fontSize: "12px",

            fontWeight: "700"

          }}

        >

          {product.category || "Electronics"}

        </div>



        <img

          src={image}

          alt={product.name}

          style={{

            width: "100%",

            height: "100%",

            objectFit: "cover"

          }}

          onError={(event) => {

            event.currentTarget.src =

              "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=900&q=90";

          }}

        />

      </div>



      <div style={{ padding: "22px" }}>

        <div

          style={{

            color: "#6366f1",

            fontSize: "13px",

            fontWeight: "800",

            marginBottom: "6px"

          }}

        >

          {product.brand || "Electronics"}

        </div>



        <h2

          style={{

            margin: "0 0 8px",

            color: "#111827",

            fontSize: "22px"

          }}

        >

          {product.name}

        </h2>



        <p

          style={{

            margin: "0 0 18px",

            color: "#64748b",

            fontSize: "14px",

            lineHeight: "1.5",

            minHeight: "42px"

          }}

        >

          {product.description ||

            product.details ||

            "High-quality electronic product."}

        </p>



        <div

          style={{

            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            marginBottom: "18px"

          }}

        >

          <strong

            style={{

              fontSize: "24px",

              color: "#111827"

            }}

          >

            ₹{Number(product.price || 0).toLocaleString("en-IN")}

          </strong>



          <span

            style={{

              background: outOfStock ? "#fef2f2" : "#ecfdf5",

              color: outOfStock ? "#dc2626" : "#16a34a",

              padding: "6px 10px",

              borderRadius: "20px",

              fontSize: "12px",

              fontWeight: "800"

            }}

          >

            {outOfStock ? "Out of stock" : `${stock} in stock`}

          </span>

        </div>



        <button

          onClick={() => onAddToCart(product)}

          disabled={outOfStock}

          style={{

            width: "100%",

            padding: "13px",

            border: "none",

            borderRadius: "10px",

            background: outOfStock ? "#cbd5e1" : "#111827",

            color: "white",

            fontSize: "15px",

            fontWeight: "800",

            cursor: outOfStock ? "not-allowed" : "pointer"

          }}

        >

          {outOfStock ? "Out of Stock" : "🛒 Add to Cart"}

        </button>

      </div>

    </div>

  );

}



function Products() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");



  const loadProducts = useCallback(async () => {

    try {

      const response = await fetch(`${API_URL}/products`);



      if (!response.ok) {

        throw new Error("Failed to load products");

      }



      const data = await response.json();



      const backendProducts = data.products || [];



      setProducts(backendProducts);

    } catch (error) {

      console.error(error);



      setError(

        "Could not load products. Make sure the backend is running."

      );

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {
    const loadInitialProducts = async () => {
      await loadProducts();
    };

    void loadInitialProducts();

  }, [loadProducts]);



  const addToCart = (product) => {

    const existingCart =

      JSON.parse(localStorage.getItem("cart")) || [];



    const existingProduct = existingCart.find(

      (item) => item.id === product.id

    );



    let updatedCart;



    if (existingProduct) {

      updatedCart = existingCart.map((item) =>

        item.id === product.id

          ? {

              ...item,

              quantity: (item.quantity || 1) + 1

            }

          : item

      );

    } else {

      updatedCart = [

        ...existingCart,

        {

          ...product,

          quantity: 1

        }

      ];

    }



    localStorage.setItem(

      "cart",

      JSON.stringify(updatedCart)

    );



    setMessage(`${product.name} added to cart`);



    setTimeout(() => {

      setMessage("");

    }, 2000);

  };



  if (loading) {

    return (

      <div

        style={{

          textAlign: "center",

          padding: "70px"

        }}

      >

        <h2>Loading products...</h2>

      </div>

    );

  }



  if (error) {

    return (

      <div

        style={{

          textAlign: "center",

          padding: "50px",

          color: "#dc2626",

          fontWeight: "700"

        }}

      >

        {error}

      </div>

    );

  }



  return (

    <div

      style={{

        maxWidth: "1400px",

        margin: "0 auto"

      }}

    >

      <div className="store-hero" style={{ marginBottom: "40px" }}>

        <div

          style={{

            color: "#000000",

            fontSize: "13px",

            fontWeight: "800",

            letterSpacing: "1.5px",

            textTransform: "uppercase",

            marginBottom: "8px"

          }}

        >

          Electronics Store

        </div>



        <h1

          style={{

            margin: "0 0 8px",

            fontSize: "48px",

            color: "#111827"

          }}

        >

          Our Products

        </h1>



        <p

          style={{

            margin: 0,

            color: "#000000",

            fontSize: "18px"

          }}

        >

          Everything you need, all in one place.

        </p>

      </div>



      {message && (

        <div

          style={{

            position: "fixed",

            top: "25px",

            right: "25px",

            background: "#16a34a",

            color: "white",

            padding: "14px 20px",

            borderRadius: "10px",

            fontWeight: "700",

            zIndex: 1000,

            boxShadow: "0 10px 25px rgba(0,0,0,0.15)"

          }}

        >

          ✓ {message}

        </div>

      )}



      <div
        className="product-grid"
        style={{
          display: "grid",

          gridTemplateColumns:

            "repeat(auto-fit, minmax(310px, 1fr))",

          gap: "28px"

        }}

      >

        {products.map((product) => (

          <Product

            key={product.id}

            product={product}

            onAddToCart={addToCart}

          />

        ))}

      </div>

    </div>

  );

}



export default Products;
