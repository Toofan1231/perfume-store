from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_admin_user
from app.models.schemas import ProductCreate, ProductUpdate
from app.services.store import new_id, store

router = APIRouter(prefix="/products", tags=["products"])


def min_price(product: dict) -> float:
    return min([size.get("price", 0) for size in product.get("sizes", [])] or [0])


@router.get("")
def list_products(
    q: str | None = None,
    categoryId: str | None = None,
    brand: str | None = None,
    gender: str | None = None,
    scentFamily: str | None = None,
    featured: bool | None = None,
    maxPrice: float | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
):
    products = [product for product in store.all("products") if product.get("active", True)]
    if q:
        term = q.lower()
        products = [p for p in products if term in json_text(p).lower()]
    if categoryId:
        products = [p for p in products if p.get("categoryId") == categoryId]
    if brand:
        products = [p for p in products if p.get("brand") == brand]
    if gender:
        products = [p for p in products if p.get("gender") == gender]
    if scentFamily:
        products = [p for p in products if p.get("scentFamily") == scentFamily]
    if featured is not None:
        products = [p for p in products if bool(p.get("featured")) == featured]
    if maxPrice is not None:
        products = [p for p in products if min_price(p) <= maxPrice]

    total = len(products)
    start = (page - 1) * limit
    end = start + limit
    return {"items": products[start:end], "page": page, "limit": limit, "total": total}


def json_text(product: dict) -> str:
    chunks = [product.get("brand", ""), product.get("concentration", ""), product.get("scentFamily", "")]
    for key in ["name", "description"]:
        value = product.get(key, {})
        if isinstance(value, dict):
            chunks.extend(value.values())
    notes = product.get("notes", {})
    for value in notes.values():
        if isinstance(value, list):
            chunks.extend(value)
    return " ".join(str(item) for item in chunks)


@router.get("/{product_id}")
def get_product(product_id: str):
    product = store.one("products", product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.post("", dependencies=[Depends(get_admin_user)])
def create_product(payload: ProductCreate):
    data = payload.model_dump()
    data.update({"id": new_id("product"), "createdAt": datetime.utcnow().isoformat(), "updatedAt": None})
    return store.insert("products", data)


@router.put("/{product_id}", dependencies=[Depends(get_admin_user)])
def update_product(product_id: str, payload: ProductUpdate):
    current = store.one("products", product_id)
    if not current:
        raise HTTPException(404, "Product not found")
    data = payload.model_dump()
    data.update({"id": product_id, "createdAt": current.get("createdAt"), "updatedAt": datetime.utcnow().isoformat()})
    return store.upsert("products", product_id, data)


@router.delete("/{product_id}", dependencies=[Depends(get_admin_user)])
def delete_product(product_id: str):
    store.delete("products", product_id)
    return {"message": "Product deleted"}
