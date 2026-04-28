from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator

Role = Literal["admin", "customer"]
Gender = Literal["men", "women", "unisex"]
OrderStatus = Literal["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
PaymentStatus = Literal["not_required", "pending", "paid", "failed"]


class ProductSize(BaseModel):
    label: str = Field(min_length=1, max_length=30)
    price: float = Field(ge=0)
    stock: int = Field(ge=0)


class LocalizedText(BaseModel):
    en: str = Field(min_length=1, max_length=4000)
    fa: str = Field(min_length=1, max_length=4000)
    ps: str = Field(min_length=1, max_length=4000)


class PerfumeNotes(BaseModel):
    top: list[str] = []
    heart: list[str] = []
    base: list[str] = []

    @field_validator("top", "heart", "base")
    @classmethod
    def limit_notes(cls, value: list[str]) -> list[str]:
        if len(value) > 12:
            raise ValueError("Maximum 12 notes are allowed")
        return value


class ProductBase(BaseModel):
    name: LocalizedText
    brand: str = Field(min_length=1, max_length=120)
    categoryId: str = Field(min_length=1, max_length=80)
    description: LocalizedText
    concentration: str = Field(min_length=1, max_length=60)
    gender: Gender = "unisex"
    scentFamily: str = Field(min_length=1, max_length=80)
    sizes: list[ProductSize] = Field(min_length=1)
    notes: PerfumeNotes
    images: list[str] = Field(default_factory=list)
    featured: bool = False
    active: bool = True

    @field_validator("images")
    @classmethod
    def limit_images(cls, value: list[str]) -> list[str]:
        if len(value) > 8:
            raise ValueError("Maximum 8 images are allowed")
        return value


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class Product(ProductBase):
    id: str
    createdAt: datetime | str
    updatedAt: datetime | str | None = None


class CategoryBase(BaseModel):
    name: LocalizedText
    slug: str = Field(min_length=1, max_length=100)
    image: str | None = None
    active: bool = True


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: str
    createdAt: datetime | str


class ShippingAddress(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=6, max_length=40)
    city: str = Field(min_length=2, max_length=80)
    address: str = Field(min_length=5, max_length=500)


class OrderItem(BaseModel):
    productId: str
    name: str
    size: str
    quantity: int = Field(ge=1)
    price: float = Field(ge=0)
    image: str | None = None


class OrderCreate(BaseModel):
    userId: str
    items: list[OrderItem] = Field(min_length=1)
    shippingAddress: ShippingAddress
    paymentMethod: Literal["cash", "card", "manual"] = "cash"


class Order(OrderCreate):
    id: str
    totalAmount: float
    status: OrderStatus = "pending"
    paymentStatus: PaymentStatus = "pending"
    createdAt: datetime | str
    updatedAt: datetime | str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class ReviewCreate(BaseModel):
    productId: str
    userId: str
    displayName: str = Field(min_length=2, max_length=120)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=1000)


class Review(ReviewCreate):
    id: str
    createdAt: datetime | str


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    displayName: str = Field(min_length=2, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserRoleUpdate(BaseModel):
    role: Role


class UserProfileUpdate(BaseModel):
    displayName: str = Field(min_length=2, max_length=120)
    addresses: list[ShippingAddress] = []


class UserProfile(BaseModel):
    uid: str
    email: EmailStr
    displayName: str
    role: Role = "customer"
    addresses: list[ShippingAddress] = []
    createdAt: datetime | str


class PaymentIntentCreate(BaseModel):
    orderId: str
    provider: Literal["demo", "stripe", "paypal", "zarinpal"] = "demo"


class PaymentIntent(BaseModel):
    id: str
    orderId: str
    provider: str
    amount: float
    status: PaymentStatus
    clientSecret: str
    createdAt: datetime | str


class ShopSettings(BaseModel):
    shopName: LocalizedText
    heroTitle: LocalizedText
    heroSubtitle: LocalizedText
    announcement: LocalizedText
    footerText: LocalizedText
    seoTitle: LocalizedText
    seoDescription: LocalizedText
    currency: str = Field(min_length=1, max_length=10)
    deliveryFee: float = Field(ge=0)
    contactPhone: str = Field(min_length=3, max_length=60)
    contactEmail: EmailStr
    contactAddress: LocalizedText
    heroImage: str = Field(min_length=1, max_length=500)
    brandTagline: LocalizedText
