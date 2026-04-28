from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.models.schemas import PaymentIntentCreate
from app.services.store import new_id, store

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-intent")
def create_payment_intent(payload: PaymentIntentCreate, user: dict = Depends(get_current_user)):
    order = store.one("orders", payload.orderId)
    if not order:
        raise HTTPException(404, "Order not found")
    payment = {
        "id": new_id("payment"),
        "orderId": payload.orderId,
        "provider": payload.provider,
        "amount": order["totalAmount"],
        "status": "pending",
        "clientSecret": f"demo_secret_{payload.orderId}",
        "createdAt": datetime.utcnow().isoformat(),
    }
    store.insert("payments", payment)
    return payment


@router.post("/demo-confirm/{payment_id}")
def demo_confirm(payment_id: str, user: dict = Depends(get_current_user)):
    payment = store.one("payments", payment_id)
    if not payment:
        raise HTTPException(404, "Payment not found")
    payment["status"] = "paid"
    store.upsert("payments", payment_id, payment)
    order = store.one("orders", payment["orderId"])
    if order:
        order["paymentStatus"] = "paid"
        order["status"] = "paid"
        order["updatedAt"] = datetime.utcnow().isoformat()
        store.upsert("orders", order["id"], order)
    return payment
