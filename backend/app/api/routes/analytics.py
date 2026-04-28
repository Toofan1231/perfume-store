from fastapi import APIRouter, Depends

from app.core.security import get_admin_user
from app.services.store import store

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", dependencies=[Depends(get_admin_user)])
def summary():
    orders = store.all("orders")
    products = store.all("products")
    users = store.all("users")
    revenue = sum(order.get("totalAmount", 0) for order in orders if order.get("status") != "cancelled")
    order_count = len(orders)
    average_order_value = revenue / order_count if order_count else 0

    product_sales: dict[str, int] = {}
    for order in orders:
        for item in order.get("items", []):
            product_sales[item["productId"]] = product_sales.get(item["productId"], 0) + item.get("quantity", 0)

    top_products = sorted(product_sales.items(), key=lambda item: item[1], reverse=True)[:5]
    return {
        "revenue": revenue,
        "orders": order_count,
        "averageOrderValue": average_order_value,
        "products": len(products),
        "users": len(users),
        "topProducts": [{"productId": product_id, "quantity": quantity} for product_id, quantity in top_products],
    }
