import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from config import settings
from database import get_db
from models import User
from routers.auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = settings.stripe_secret_key

PLAN_LIMITS = {
    "free": 5,
    "standard": 15,
    "pro": 999,
}

PRICE_TO_PLAN = {}  # populated at runtime


def get_plan_limit(plan: str) -> int:
    return PLAN_LIMITS.get(plan, 5)


class CheckoutRequest(BaseModel):
    plan: str  # "standard" or "pro"
    success_url: str
    cancel_url: str


@router.post("/checkout")
def create_checkout(
    body: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe未設定")

    price_id = {
        "standard": settings.stripe_standard_price_id,
        "pro": settings.stripe_pro_price_id,
    }.get(body.plan)

    if not price_id:
        raise HTTPException(status_code=400, detail="無効なプランです")

    # Stripeカスタマー作成（初回のみ）
    customer_id = current_user.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(email=current_user.email, metadata={"user_id": current_user.id})
        current_user.stripe_customer_id = customer.id
        db.commit()
        customer_id = customer.id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=body.success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=body.cancel_url,
        metadata={"user_id": str(current_user.id), "plan": body.plan},
    )

    return {"url": session.url}


@router.post("/portal")
def customer_portal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """サブスクリプション管理ポータル"""
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="サブスクリプションがありません")

    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url="https://frontend-3qj7hxjv6-beautifel21-coders-projects.vercel.app/pricing",
    )
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Stripeのイベントを受け取りプランを更新"""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        if settings.stripe_webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
        else:
            import json
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session.get("metadata", {}).get("user_id", 0))
        plan = session.get("metadata", {}).get("plan", "free")
        sub_id = session.get("subscription")

        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.plan = plan
                user.stripe_subscription_id = sub_id
                db.commit()

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.plan = "free"
            user.stripe_subscription_id = None
            db.commit()

    return {"ok": True}


@router.get("/me")
def my_plan(current_user: User = Depends(get_current_user)):
    return {
        "plan": current_user.plan,
        "limit": get_plan_limit(current_user.plan),
    }
