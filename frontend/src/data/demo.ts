import type { Category, Product, Review, ShopSettings, UserProfile } from "@/types";


export const demoSettings: ShopSettings = {
  shopName: {
    en: "Luxora",
    fa: "لوکسورا",
    ps: "لوکسورا"
  },
  heroTitle: {
    en: "Signature perfumes for every unforgettable moment.",
    fa: "عطرهای خاص برای هر لحظهٔ فراموش‌نشدنی.",
    ps: "د هرې نه هېرېدونکې شېبې لپاره ځانګړي عطرونه."
  },
  heroSubtitle: {
    en: "Discover oud, floral, fresh, woody, and oriental fragrances curated for elegant daily wear and special gifts.",
    fa: "عود، رایحه‌های گلی، تازه، چوبی و شرقی را برای استفاده روزانه و هدیه‌های خاص کشف کنید.",
    ps: "عود، ګل بوی، تازه، لرګین او شرقي عطرونه د ورځني استعمال او ځانګړو ډالیو لپاره ومومئ."
  },
  announcement: {
    en: "Free gift wrapping for orders above $120.",
    fa: "بسته‌بندی تحفه برای سفارش‌های بالاتر از ۱۲۰ دالر رایگان است.",
    ps: "له ۱۲۰ ډالرو پورته فرمایشونو لپاره د ډالۍ بسته‌بندي وړیا ده."
  },
  footerText: {
    en: "Premium multilingual fragrance store with full storefront, customer profile, admin panel, and FastAPI backend.",
    fa: "فروشگاه چندزبانه عطر با فروشگاه کامل، پروفایل مشتری، پنل مدیریت و بک‌اند FastAPI.",
    ps: "څو ژبنی عطري دوکان د بشپړ storefront، د مشتری پروفایل، ادمین پینل او FastAPI بک‌اند سره."
  },
  seoTitle: {
    en: "Luxora Perfume Store",
    fa: "فروشگاه عطر لوکسورا",
    ps: "د لوکسورا عطرو دوکان"
  },
  seoDescription: {
    en: "Buy premium oud, floral, fresh, oriental, and gift perfume sets online.",
    fa: "خرید آنلاین عطرهای عود، گلی، تازه، شرقی و ست‌های تحفه.",
    ps: "عود، ګل بوی، تازه، شرقي او د ډالۍ عطري سېټونه آنلاین واخلئ."
  },
  currency: "$",
  deliveryFee: 5,
  contactPhone: "+93 700 000 000",
  contactEmail: "sales@luxora.dev",
  contactAddress: {
    en: "Kabul, Afghanistan",
    fa: "کابل، افغانستان",
    ps: "کابل، افغانستان"
  },
  heroImage: "/images/perfume-hero.svg",
  brandTagline: {
    en: "Perfume House",
    fa: "خانه عطر",
    ps: "د عطرو کور"
  }
} as ShopSettings;


export const demoCategories: Category[] = [
  {
    "id": "cat-edp",
    "name": {
      "en": "Eau de Parfum",
      "fa": "او دو پرفیوم",
      "ps": "او دو پرفیوم"
    },
    "slug": "eau-de-parfum",
    "image": "/images/perfume-oud.svg",
    "active": true,
    "createdAt": "2026-01-01T00:00:00"
  },
  {
    "id": "cat-edt",
    "name": {
      "en": "Eau de Toilette",
      "fa": "او دو تویلت",
      "ps": "او دو تویلت"
    },
    "slug": "eau-de-toilette",
    "image": "/images/perfume-blue.svg",
    "active": true,
    "createdAt": "2026-01-01T00:00:00"
  },
  {
    "id": "cat-attar",
    "name": {
      "en": "Attar Oil",
      "fa": "عطر روغنی",
      "ps": "عطري تېل"
    },
    "slug": "attar",
    "image": "/images/perfume-amber.svg",
    "active": true,
    "createdAt": "2026-01-01T00:00:00"
  },
  {
    "id": "cat-gift",
    "name": {
      "en": "Gift Sets",
      "fa": "ست‌های تحفه",
      "ps": "د ډالۍ سېټونه"
    },
    "slug": "gift-sets",
    "image": "/images/perfume-gift.svg",
    "active": true,
    "createdAt": "2026-01-01T00:00:00"
  }
] as Category[];

export const demoProducts: Product[] = [
  {
    "id": "p-oud-royale",
    "name": {
      "en": "Oud Royale",
      "fa": "عود رویال",
      "ps": "عود رویال"
    },
    "brand": "Luxora Private Blend",
    "categoryId": "cat-edp",
    "description": {
      "en": "Deep oud, amber, saffron, and warm woods for a powerful evening signature.",
      "fa": "ترکیبی عمیق از عود، عنبر، زعفران و چوب‌های گرم برای امضای شامگاهی قدرتمند.",
      "ps": "د عود، عنبر، زعفران او ګرمو لرګیو ژوره ګډونه د ماښام لپاره ځانګړی بوی."
    },
    "concentration": "EDP",
    "gender": "unisex",
    "scentFamily": "woody",
    "sizes": [
      {
        "label": "50ml",
        "price": 84,
        "stock": 14
      },
      {
        "label": "100ml",
        "price": 145,
        "stock": 24
      }
    ],
    "notes": {
      "top": [
        "Saffron",
        "Pink Pepper"
      ],
      "heart": [
        "Oud",
        "Rose"
      ],
      "base": [
        "Amber",
        "Leather"
      ]
    },
    "images": [
      "/images/perfume-oud.svg"
    ],
    "featured": true,
    "active": true,
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": null
  },
  {
    "id": "p-rose-velvet",
    "name": {
      "en": "Rose Velvet",
      "fa": "رز مخملی",
      "ps": "مخملي ګلاب"
    },
    "brand": "Maison Aura",
    "categoryId": "cat-edp",
    "description": {
      "en": "Soft rose, vanilla, and musk with a luxurious velvet dry down.",
      "fa": "رز نرم، وانیل و مشک با پایان مخملی و لوکس.",
      "ps": "نرم ګلاب، وانیل او مشک د لوکس مخملي پای سره."
    },
    "concentration": "EDP",
    "gender": "women",
    "scentFamily": "floral",
    "sizes": [
      {
        "label": "30ml",
        "price": 58,
        "stock": 20
      },
      {
        "label": "75ml",
        "price": 118,
        "stock": 32
      }
    ],
    "notes": {
      "top": [
        "Pear",
        "Bergamot"
      ],
      "heart": [
        "Rose",
        "Jasmine"
      ],
      "base": [
        "Vanilla",
        "Musk"
      ]
    },
    "images": [
      "/images/perfume-rose.svg"
    ],
    "featured": true,
    "active": true,
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": null
  },
  {
    "id": "p-citrus-noir",
    "name": {
      "en": "Citrus Noir",
      "fa": "سیتروس نوار",
      "ps": "سیتروس نوار"
    },
    "brand": "North Atelier",
    "categoryId": "cat-edt",
    "description": {
      "en": "Bright bergamot over smoky vetiver and black pepper for clean confidence.",
      "fa": "برگاموت روشن روی وتیور دودی و مرچ سیاه برای حس اعتماد پاک و مدرن.",
      "ps": "روښانه برګاموت له لوګین ویټیور او تور مرچ سره د پاک اعتماد لپاره."
    },
    "concentration": "EDT",
    "gender": "men",
    "scentFamily": "fresh",
    "sizes": [
      {
        "label": "50ml",
        "price": 52,
        "stock": 12
      },
      {
        "label": "100ml",
        "price": 86,
        "stock": 18
      }
    ],
    "notes": {
      "top": [
        "Bergamot",
        "Lemon"
      ],
      "heart": [
        "Black Pepper",
        "Lavender"
      ],
      "base": [
        "Vetiver",
        "Cedar"
      ]
    },
    "images": [
      "/images/perfume-citrus.svg"
    ],
    "featured": false,
    "active": true,
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": null
  },
  {
    "id": "p-amber-silk",
    "name": {
      "en": "Amber Silk",
      "fa": "عنبر ابریشمی",
      "ps": "ورېښمین عنبر"
    },
    "brand": "Sahara Notes",
    "categoryId": "cat-attar",
    "description": {
      "en": "Golden amber, tonka, and sandalwood wrapped in a smooth silky finish.",
      "fa": "عنبر طلایی، تونکا و صندل با پایان نرم و ابریشمی.",
      "ps": "طلایي عنبر، تونکا او صندل د نرم ورېښمین پای سره."
    },
    "concentration": "Attar Oil",
    "gender": "unisex",
    "scentFamily": "oriental",
    "sizes": [
      {
        "label": "6ml",
        "price": 38,
        "stock": 22
      },
      {
        "label": "12ml",
        "price": 64,
        "stock": 40
      }
    ],
    "notes": {
      "top": [
        "Saffron"
      ],
      "heart": [
        "Amber",
        "Tonka"
      ],
      "base": [
        "Sandalwood",
        "Musk"
      ]
    },
    "images": [
      "/images/perfume-amber.svg"
    ],
    "featured": true,
    "active": true,
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": null
  },
  {
    "id": "p-fresh-azure",
    "name": {
      "en": "Fresh Azure",
      "fa": "فرش آژور",
      "ps": "فرش آژور"
    },
    "brand": "Blue Harbor",
    "categoryId": "cat-edt",
    "description": {
      "en": "Marine freshness, mint, and white cedar for a crisp daily fragrance.",
      "fa": "تازگی دریایی، نعناع و سدر سفید برای عطر روزانهٔ شفاف و تمیز.",
      "ps": "سمندري تازګي، نعناع او سپین سدر د ورځني پاک بوی لپاره."
    },
    "concentration": "EDT",
    "gender": "men",
    "scentFamily": "aquatic",
    "sizes": [
      {
        "label": "90ml",
        "price": 72,
        "stock": 27
      }
    ],
    "notes": {
      "top": [
        "Marine",
        "Mint"
      ],
      "heart": [
        "Lavender"
      ],
      "base": [
        "White Cedar",
        "Musk"
      ]
    },
    "images": [
      "/images/perfume-blue.svg"
    ],
    "featured": false,
    "active": true,
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": null
  },
  {
    "id": "p-gift-trio",
    "name": {
      "en": "Discovery Gift Trio",
      "fa": "ست تحفه سه‌گانه",
      "ps": "درې‌ګونی ډالۍ سېټ"
    },
    "brand": "Luxora Gifts",
    "categoryId": "cat-gift",
    "description": {
      "en": "Three elegant mini perfumes in a premium box for gifting and discovery.",
      "fa": "سه عطر کوچک و شیک در یک جعبه لوکس برای تحفه و تجربه رایحه‌ها.",
      "ps": "درې ښکلي کوچني عطرونه په لوکس بکس کې د ډالۍ او ازموینې لپاره."
    },
    "concentration": "Mixed",
    "gender": "unisex",
    "scentFamily": "gift",
    "sizes": [
      {
        "label": "3 × 30ml",
        "price": 132,
        "stock": 15
      }
    ],
    "notes": {
      "top": [
        "Fresh Citrus"
      ],
      "heart": [
        "Rose",
        "Oud"
      ],
      "base": [
        "Amber",
        "Clean Musk"
      ]
    },
    "images": [
      "/images/perfume-gift.svg"
    ],
    "featured": true,
    "active": true,
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": null
  }
] as Product[];

export const demoReviews: Review[] = [
  {
    "id": "r-1",
    "productId": "p-oud-royale",
    "userId": "customer-demo",
    "displayName": "Demo Customer",
    "rating": 5,
    "comment": "Excellent oud fragrance with long-lasting performance.",
    "createdAt": "2026-01-01T00:00:00"
  },
  {
    "id": "r-2",
    "productId": "p-rose-velvet",
    "userId": "customer-demo",
    "displayName": "Demo Customer",
    "rating": 4,
    "comment": "Soft, elegant, and perfect for gifting.",
    "createdAt": "2026-01-01T00:00:00"
  }
] as Review[];

export const demoUsers: Array<UserProfile & { password: string }> = [
  {
    "uid": "admin-demo",
    "email": "admin@luxora.dev",
    "displayName": "Demo Admin",
    "role": "admin",
    "addresses": [],
    "createdAt": "2026-01-01T00:00:00",
    "password": "admin12345"
  },
  {
    "uid": "customer-demo",
    "email": "customer@luxora.dev",
    "displayName": "Demo Customer",
    "role": "customer",
    "addresses": [],
    "createdAt": "2026-01-01T00:00:00",
    "password": "customer12345"
  }
] as Array<UserProfile & { password: string }>;
