// Glory Empire - Core Product Database
const storeProducts = [
  {
    id: "ge-001",
    title: "Designer Leather Strappy Sandals",
    category: "Footwear",
    retailPrice: 250.00,
    vipPrice: 220.00,          // Monthly VIP subscriber discount rate
    wholesalePrice: 180.00,    // Wholesale price per unit
    wholesaleMinQty: 5,        // Minimum order quantity for wholesale
    badge: "Top Seller",
    views: 1240,
    salesCount: 310,
    isFavorite: true,
    inStock: true,
    stockCount: 8,
    description: "Handcrafted genuine leather sandals with durable sole. Elegant finish for formal and casual wear.",
    images: [
      "https://via.placeholder.com/600x600/ffffff/111827?text=Glory+Empire+Sandals+1",
      "https://via.placeholder.com/600x600/ffffff/111827?text=Glory+Empire+Sandals+2",
      "https://via.placeholder.com/600x600/ffffff/111827?text=Glory+Empire+Sandals+3"
    ],
    variants: {
      sizes: ["40", "41", "42", "43", "44"],
      colors: ["Black", "Brown", "Tan"]
    }
  },
  {
    id: "ge-002",
    title: "Luxury Gold-Plated Cuban Chain",
    category: "Accessories",
    retailPrice: 180.00,
    vipPrice: 150.00,
    wholesalePrice: 110.00,
    wholesaleMinQty: 10,
    badge: "Trending",
    views: 980,
    salesCount: 195,
    isFavorite: false,
    inStock: true,
    stockCount: 15,
    description: "Premium stainless steel base with non-tarnish triple gold plating. High-luster polished finish.",
    images: [
      "https://via.placeholder.com/600x600/ffffff/111827?text=Glory+Empire+Chain+1",
      "https://via.placeholder.com/600x600/ffffff/111827?text=Glory+Empire+Chain+2"
    ],
    variants: {
      sizes: ["18 inch", "20 inch", "24 inch"],
      colors: ["Yellow Gold", "Silver"]
    }
  },
  {
    id: "ge-003",
    title: "Oud Royale Extrait de Parfum (100ml)",
    category: "Beauty",
    retailPrice: 350.00,
    vipPrice: 300.00,
    wholesalePrice: 240.00,
    wholesaleMinQty: 6,
    badge: "Most Viewed",
    views: 2150,
    salesCount: 420,
    isFavorite: true,
    inStock: true,
    stockCount: 4,              // Triggers low stock alert
    description: "Long-lasting luxury fragrance infused with rich amber, dark wood, and oriental spices.",
    images: [
      "https://via.placeholder.com/600x600/ffffff/111827?text=Glory+Empire+Perfume+1"
    ],
    variants: {
      sizes: ["100ml"],
      colors: ["Original"]
    }
  }
];

// Configuration Object
const GLORY_EMPIRE_CONFIG = {
  storeName: "Glory Empire",
  whatsappNumber: "233540952697",
  vipMonthlyFee: 50.00,
  currency: "GH₵",
  location: "Ghana"
};