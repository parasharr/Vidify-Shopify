export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductVariant = {
  name: string;
  sku: string;
  price: string;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

export const products: Product[] = [
  {
    id: "1",
    slug: "vintage-leather-satchel",
    title: "Vintage Leather Satchel",
    price: 120,
    description:
      "Crafted from authentic, full-grain leather, this vintage-inspired satchel combines timeless elegance with modern functionality. Featuring robust stitching, adjustable shoulder strap, and multiple internal compartments, it's perfect for daily commutes, travel, or as a stylish accessory for any outfit. The leather will develop a rich patina over time, telling its own unique story.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=650&fit=crop",
        alt: "Vintage leather satchel on a desk with plant accent",
      },
      {
        src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=650&fit=crop",
        alt: "Close-up of satchel straps and hardware",
      },
      {
        src: "https://images.unsplash.com/photo-1518544732587-61996a3494b8?w=900&h=650&fit=crop",
        alt: "Interior compartments of the satchel",
      },
      {
        src: "https://images.unsplash.com/photo-1525904097878-94fb15835963?w=900&h=650&fit=crop",
        alt: "Satchel displayed alongside matching accessories",
      },
    ],
    variants: [
      {
        name: "Vintage Brown",
        sku: "VLS-BRN-001",
        price: "$120.00",
        stock: 25,
      },
    ],
  },
  {
    id: "2",
    slug: "handcrafted-ceramic-mug",
    title: "Handcrafted Ceramic Mug",
    price: 25,
    description:
      "Experience the joy of mindful sipping with this handcrafted ceramic mug. Each piece is wheel-thrown by artisans and finished with a warm, earthy glaze. The comfortable handle and gently tapered rim make every pour feel special, whether it's your morning coffee or herbal tea.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1455853659719-4b521eebc76d?w=900&h=650&fit=crop",
        alt: "Handcrafted ceramic mug on a wooden table",
      },
      {
        src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&h=650&fit=crop",
        alt: "Close-up of the mug glaze and handle",
      },
    ],
    variants: [
      {
        name: "Speckled Sand",
        sku: "HCM-SPK-002",
        price: "$25.00",
        stock: 48,
      },
    ],
  },
  {
    id: "3",
    slug: "eco-friendly-yoga-mat",
    title: "Eco-Friendly Yoga Mat",
    price: 45,
    description:
      "This eco-friendly yoga mat is crafted from sustainably sourced natural rubber with a textured non-slip surface for extra stability. Its supportive cushioning and calming botanical pattern invite balance and focus into every practice.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1602211844071-3edc525ec23b?w=900&h=650&fit=crop",
        alt: "Eco-friendly yoga mat rolled out with matching accessories",
      },
      {
        src: "https://images.unsplash.com/photo-1549572189-b9b9f9c1c1f3?w=900&h=650&fit=crop",
        alt: "Rolled yoga mat with strap",
      },
    ],
    variants: [
      {
        name: "Forest Bloom",
        sku: "EFY-FST-003",
        price: "$45.00",
        stock: 62,
      },
    ],
  },
  {
    id: "4",
    slug: "minimalist-smartwatch",
    title: "Minimalist Smartwatch",
    price: 199.99,
    description:
      "A sleek smartwatch designed for modern minimalists. Featuring a vivid OLED display, heart-rate monitoring, and seamless notifications, it pairs effortlessly with any look. The lightweight aluminum body and interchangeable bands keep comfort and style front and center.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=650&fit=crop",
        alt: "Minimalist smartwatch showing the time",
      },
      {
        src: "https://images.unsplash.com/photo-1473654729523-203e25dfda10?w=900&h=650&fit=crop",
        alt: "Smartwatch laid flat on a desk",
      },
    ],
    variants: [
      {
        name: "Silver / Cloud Band",
        sku: "MSW-SLV-004",
        price: "$199.99",
        stock: 18,
      },
    ],
  },
];

