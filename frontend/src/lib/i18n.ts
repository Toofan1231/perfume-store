import type { Gender, Language, LocalizedText, OrderStatus } from "@/types";

export const languageMeta: Record<Language, { label: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", dir: "ltr" },
  fa: { label: "دری", dir: "rtl" },
  ps: { label: "پښتو", dir: "rtl" }
};

export const pickText = (value: LocalizedText | string | undefined, language: Language) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || "";
};

export const dictionaries: Record<Language, Record<string, string>> = {
  en: {
    home:"Home", products:"Products", cart:"Cart", admin:"Admin", profile:"Profile", login:"Login", logout:"Logout", register:"Register",
    search:"Search perfumes...", shopNow:"Shop now", featured:"Featured perfumes", addToCart:"Add to cart", viewDetails:"View details", viewAll:"View all",
    checkout:"Checkout", subtotal:"Subtotal", delivery:"Delivery", total:"Total", placeOrder:"Place order", fullName:"Full name", phone:"Phone", city:"City",
    address:"Address", paymentMethod:"Payment method", cash:"Cash on delivery", card:"Demo card", emptyCart:"Your cart is empty.", dashboard:"Dashboard",
    manageProducts:"Manage products", manageOrders:"Manage orders", manageCategories:"Manage categories", manageReviews:"Manage reviews", manageUsers:"Manage users",
    shopSettings:"Shop settings", save:"Save", delete:"Delete", edit:"Edit", cancel:"Cancel", category:"Category", brand:"Brand", gender:"Gender", scent:"Scent",
    price:"Price", size:"Size", stock:"Stock", description:"Description", notes:"Notes", reviews:"Reviews", writeReview:"Write review", orderHistory:"Order history",
    adminLogin:"Admin login", customerLogin:"Customer login", email:"Email", password:"Password", topNotes:"Top notes", heartNotes:"Heart notes", baseNotes:"Base notes",
    analytics:"Analytics", revenue:"Revenue", orders:"Orders", users:"Users", averageOrder:"Average order", useDemoAdmin:"Use demo admin", useDemoCustomer:"Use demo customer",
    all:"All", men:"Men", women:"Women", unisex:"Unisex", woody:"Woody", floral:"Floral", fresh:"Fresh", oriental:"Oriental", aquatic:"Aquatic", gift:"Gift",
    payment:"Payment", demoPayment:"Demo payment", status:"Status", settings:"Settings", content:"Content", seo:"SEO", contact:"Contact", hero:"Hero", footer:"Footer",
    shopName:"Shop name", heroTitle:"Hero title", heroSubtitle:"Hero subtitle", announcement:"Announcement", footerText:"Footer text", seoTitle:"SEO title",
    seoDescription:"SEO description", currency:"Currency", deliveryFee:"Delivery fee", contactPhone:"Contact phone", contactEmail:"Contact email", contactAddress:"Contact address",
    heroImage:"Hero image", brandTagline:"Brand tagline", active:"Active", featuredProduct:"Featured product", productList:"Product list", noOrders:"No orders yet.",
    noReviews:"No reviews yet.", noProducts:"No products found.", resetForm:"Reset form", confirmDelete:"Are you sure?", role:"Role", customer:"Customer",
    adminRole:"Admin", orderDetails:"Order details", account:"Account", savedAddresses:"Saved addresses", addAddress:"Add address", updateRole:"Update role"
  },
  fa: {
    home:"خانه", products:"محصولات", cart:"سبد خرید", admin:"مدیریت", profile:"پروفایل", login:"ورود", logout:"خروج", register:"ثبت‌نام",
    search:"جستجوی عطر...", shopNow:"خرید کنید", featured:"عطرهای ویژه", addToCart:"افزودن به سبد", viewDetails:"دیدن جزئیات", viewAll:"دیدن همه",
    checkout:"ثبت سفارش", subtotal:"جمع جزء", delivery:"تحویل", total:"مجموع", placeOrder:"ثبت سفارش", fullName:"نام کامل", phone:"شماره تماس", city:"شهر",
    address:"آدرس", paymentMethod:"روش پرداخت", cash:"پرداخت هنگام تحویل", card:"پرداخت نمایشی", emptyCart:"سبد خرید شما خالی است.", dashboard:"داشبورد",
    manageProducts:"مدیریت محصولات", manageOrders:"مدیریت سفارش‌ها", manageCategories:"مدیریت کتگوری‌ها", manageReviews:"مدیریت نظریات", manageUsers:"مدیریت کاربران",
    shopSettings:"تنظیمات فروشگاه", save:"ذخیره", delete:"حذف", edit:"ویرایش", cancel:"لغو", category:"کتگوری", brand:"برند", gender:"جنسیت", scent:"رایحه",
    price:"قیمت", size:"سایز", stock:"موجودی", description:"توضیحات", notes:"نوت‌ها", reviews:"نظریات", writeReview:"نوشتن نظر", orderHistory:"تاریخچه سفارش‌ها",
    adminLogin:"ورود مدیریت", customerLogin:"ورود مشتری", email:"ایمیل", password:"رمز عبور", topNotes:"نوت‌های آغازین", heartNotes:"نوت‌های میانی", baseNotes:"نوت‌های پایه",
    analytics:"تحلیل‌ها", revenue:"فروش کل", orders:"سفارش‌ها", users:"کاربران", averageOrder:"میانگین سفارش", useDemoAdmin:"ورود دمو ادمین", useDemoCustomer:"ورود دمو مشتری",
    all:"همه", men:"مردانه", women:"زنانه", unisex:"یونیسکس", woody:"چوبی", floral:"گلی", fresh:"تازه", oriental:"شرقی", aquatic:"دریایی", gift:"تحفه",
    payment:"پرداخت", demoPayment:"پرداخت نمایشی", status:"وضعیت", settings:"تنظیمات", content:"محتوا", seo:"سئو", contact:"تماس", hero:"بخش اصلی", footer:"فوتر",
    shopName:"نام فروشگاه", heroTitle:"عنوان اصلی", heroSubtitle:"متن معرفی", announcement:"اعلان", footerText:"متن فوتر", seoTitle:"عنوان سئو",
    seoDescription:"توضیح سئو", currency:"واحد پول", deliveryFee:"هزینه تحویل", contactPhone:"شماره تماس", contactEmail:"ایمیل تماس", contactAddress:"آدرس تماس",
    heroImage:"تصویر اصلی", brandTagline:"شعار برند", active:"فعال", featuredProduct:"محصول ویژه", productList:"لیست محصولات", noOrders:"هنوز سفارشی نیست.",
    noReviews:"هنوز نظری ثبت نشده.", noProducts:"محصولی یافت نشد.", resetForm:"پاک‌سازی فورم", confirmDelete:"آیا مطمئن هستید؟", role:"نقش", customer:"مشتری",
    adminRole:"مدیر", orderDetails:"جزئیات سفارش", account:"حساب کاربری", savedAddresses:"آدرس‌های ذخیره‌شده", addAddress:"افزودن آدرس", updateRole:"تغییر نقش"
  },
  ps: {
    home:"کور", products:"محصولات", cart:"کراچۍ", admin:"اداره", profile:"پروفایل", login:"ننوتل", logout:"وتل", register:"نوملیکنه",
    search:"عطر ولټوئ...", shopNow:"اوس واخلئ", featured:"ځانګړي عطرونه", addToCart:"کراچۍ ته اضافه کړئ", viewDetails:"جزئیات وګورئ", viewAll:"ټول وګورئ",
    checkout:"سفارش ثبتول", subtotal:"فرعي مجموعه", delivery:"رسونه", total:"ټول", placeOrder:"سفارش ثبت کړئ", fullName:"بشپړ نوم", phone:"ټیلیفون", city:"ښار",
    address:"پته", paymentMethod:"د تادیې طریقه", cash:"د رسولو پر وخت پیسې", card:"نمایشي تادیه", emptyCart:"ستاسې کراچۍ تشه ده.", dashboard:"ډشبورډ",
    manageProducts:"د محصولاتو اداره", manageOrders:"د سفارشونو اداره", manageCategories:"د کټګوریو اداره", manageReviews:"د نظرونو اداره", manageUsers:"د کارونکو اداره",
    shopSettings:"د دوکان تنظیمات", save:"ثبتول", delete:"حذف", edit:"سمول", cancel:"لغوه", category:"کټګوري", brand:"برنډ", gender:"جنسیت", scent:"بوی",
    price:"بیه", size:"اندازه", stock:"ذخیره", description:"توضیحات", notes:"نوټونه", reviews:"نظرونه", writeReview:"نظر ولیکئ", orderHistory:"د سفارش تاریخچه",
    adminLogin:"د ادارې ننوتل", customerLogin:"د مشتری ننوتل", email:"ایمیل", password:"رمز", topNotes:"لومړني نوټونه", heartNotes:"منځني نوټونه", baseNotes:"بنسټیز نوټونه",
    analytics:"تحلیلونه", revenue:"ټول پلور", orders:"سفارشونه", users:"کاروونکي", averageOrder:"منځنی سفارش", useDemoAdmin:"ډیمو ادمین", useDemoCustomer:"ډیمو مشتری",
    all:"ټول", men:"نارینه", women:"ښځینه", unisex:"یونیسکس", woody:"لرګین", floral:"ګل بوی", fresh:"تازه", oriental:"شرقي", aquatic:"دریايي", gift:"ډالۍ",
    payment:"تادیه", demoPayment:"نمایشي تادیه", status:"حالت", settings:"تنظیمات", content:"محتوا", seo:"SEO", contact:"اړیکه", hero:"اصلي برخه", footer:"فوتر",
    shopName:"د دوکان نوم", heroTitle:"اصلي سرلیک", heroSubtitle:"معرفي متن", announcement:"اعلان", footerText:"د فوتر متن", seoTitle:"SEO سرلیک",
    seoDescription:"SEO توضیح", currency:"پولي واحد", deliveryFee:"د رسولو لګښت", contactPhone:"د اړیکې شمېره", contactEmail:"د اړیکې ایمیل", contactAddress:"د اړیکې پته",
    heroImage:"اصلي انځور", brandTagline:"د برنډ شعار", active:"فعال", featuredProduct:"ځانګړی محصول", productList:"د محصولاتو لیست", noOrders:"تر اوسه سفارش نشته.",
    noReviews:"تر اوسه نظر نشته.", noProducts:"محصول ونه موندل شو.", resetForm:"فورم پاکول", confirmDelete:"ډاډه یاست؟", role:"رول", customer:"مشتری",
    adminRole:"ادمین", orderDetails:"د سفارش جزئیات", account:"حساب", savedAddresses:"ثبت شوې پتې", addAddress:"پته اضافه کړئ", updateRole:"رول بدلول"
  }
};

export const statusLabels: Record<OrderStatus, string> = { pending:"Pending", paid:"Paid", processing:"Processing", shipped:"Shipped", delivered:"Delivered", cancelled:"Cancelled" };
export const genderKeys: Gender[] = ["men", "women", "unisex"];
export const scentFamilies = ["woody", "floral", "fresh", "oriental", "aquatic", "gift"];
