from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User, Profile
from app.schemas.auth import ProfileOut, ProfileUpdate, UserOut

router = APIRouter(prefix="/api/profile", tags=["User Profile & Preferences"])


@router.get("", response_model=ProfileOut)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.id,
            preferred_currency="USD",
            preferred_language="en",
            travel_styles=["Luxury", "Culture"],
            dietary_preferences=["Vegetarian"],
            interests=["Architecture", "Fine Dining", "Scenic Rail"]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ProfileOut.from_orm(profile)


@router.put("", response_model=ProfileOut)
def update_user_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if req.avatar_url is not None:
        profile.avatar_url = req.avatar_url
    if req.home_city is not None:
        profile.home_city = req.home_city
    if req.home_country is not None:
        profile.home_country = req.home_country
    if req.preferred_currency is not None:
        profile.preferred_currency = req.preferred_currency
    if req.preferred_language is not None:
        profile.preferred_language = req.preferred_language
    if req.bio is not None:
        profile.bio = req.bio
    if req.travel_styles is not None:
        profile.travel_styles = req.travel_styles
    if req.dietary_preferences is not None:
        profile.dietary_preferences = req.dietary_preferences
    if req.interests is not None:
        profile.interests = req.interests
    if req.accessibility_needs is not None:
        profile.accessibility_needs = req.accessibility_needs

    db.commit()
    db.refresh(profile)
    return ProfileOut.from_orm(profile)
