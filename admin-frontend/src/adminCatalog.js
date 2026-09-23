export const adminDemoProducts = [
  ["MacBook Air", "Apple", "Laptops", "Lightweight and powerful laptop for work and study.", 89999, 10],
  ["Apple AirPods", "Apple", "Earbuds", "Wireless earbuds with a compact charging case.", 19999, 20],
  ["Apple iPad", "Apple", "Tablet", "Powerful tablet for study, work and entertainment.", 49999, 10],
  ["Samsung Galaxy Watch", "Samsung", "Smartwatch", "Smartwatch with fitness tracking and smart features.", 19999, 12],
  ["Canon EOS Camera", "Canon", "Camera", "Digital camera for photography and professional content.", 64999, 8],
  ["Sony Bravia Smart TV", "Sony", "Television", "4K smart television with an immersive viewing experience.", 79999, 6],
  ["JBL Bluetooth Speaker", "JBL", "Speakers", "Portable wireless speaker with powerful sound.", 8999, 20],
  ["PlayStation 5", "Sony", "Gaming", "Next-generation gaming console for immersive gaming.", 49999, 7],
  ["Dell Monitor", "Dell", "Monitors", "Full HD monitor suitable for work, study and gaming.", 18999, 12],
  ["Logitech Wireless Keyboard", "Logitech", "Accessories", "Comfortable wireless keyboard for everyday computing.", 2499, 25],
  ["Logitech Wireless Mouse", "Logitech", "Accessories", "Smooth and reliable wireless mouse.", 1499, 30],
  ["HP Printer", "HP", "Printer", "Wireless printer for home, college and office use.", 12999, 8],
  ["Samsung Galaxy S25", "Samsung", "Smartphones", "Premium Android smartphone with advanced performance.", 74999, 10],
  ["Apple MacBook Pro", "Apple", "Laptops", "High-performance professional laptop.", 149999, 5],
  ["Amazon Echo Speaker", "Amazon", "Smart Home", "Smart speaker with voice assistant features.", 5499, 15]
].map(([name, brand, category, description, price, stock], index) => ({
  id: -(index + 2),
  name,
  brand,
  category,
  description,
  price,
  stock
}));

export function getAdminProductImage(product) {
  const providedImage = product.image_url || product.image;

  if (providedImage?.trim()) {
    return providedImage.trim();
  }

  const productName = String(product.name || "").trim().toLowerCase();
  const text = `${productName} ${product.brand || ""} ${product.category || ""}`.toLowerCase();
  const exactImages = [
    ["amazon echo", "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=300&q=80"],
    ["apple macbook pro", "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSA4ImfmMI5O7l2aJMy5nDOvTsdK3D3ouTVcTkyxSjXswCR2LXj1pcFsbazctGW8Wt18kzrnONTvXs00tIMG0nRioE9uUgixYnQwNWr0PDurceNqsCqHkTFfxcqPoEfYd4BXYQloQ&usqp=CAc"],
    ["macbook air", "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQM3jvw-98JKMFLz-OcZI5lGbfps3pcw16HH6YCoxvwR26I_8du9ZPEJo3RFzRqPQpVds4BjJsqbk3bhqUb83RXT1DKmHy7TyJV-9Vx-9e-9Ry_CenaZ-NIdxJv"],
    ["galaxy s25", "https://images.unsplash.com/photo-1610945415295-d9bbf0a5b6c8?auto=format&fit=crop&w=300&q=80"],
    ["iphone", "https://images.unsplash.com/photo-1592286927505-2fd0e4f4b2e5?auto=format&fit=crop&w=300&q=80"],
    ["dell", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80"],
    ["hp printer", "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=300&q=80"],
    ["wireless keyboard", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80"],
    ["wireless mouse", "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=300&q=80"]
  ];
  const exactMatch = exactImages.find(([keyword]) =>
    productName === keyword
  );

  if (exactMatch) {
    return exactMatch[1];
  }

  const images = [
    ["macbook", "https://images.unsplash.com/photo-1517336714739-240756b6e7e5?auto=format&fit=crop&w=300&q=80"],
    ["airpods", "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=300&q=80"],
    ["ipad", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=300&q=80"],
    ["watch", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80"],
    ["camera", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80"],
    ["tv", "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=300&q=80"],
    ["speaker", "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=300&q=80"],
    ["gaming", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=300&q=80"],
    ["monitor", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80"]
  ];
  const match = images.find(([keyword]) => text.includes(keyword));
  return match?.[1] || "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=300&q=80";
}
