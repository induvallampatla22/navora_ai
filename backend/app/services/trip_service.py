import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.trip import Trip, TripMember, TripPreference, Itinerary, ItineraryItem
from app.models.catalog import Destination, Hotel, Experience, Restaurant, Agency
from app.models.reward import CoinWallet, CoinTransaction
from app.models.community import Notification
from app.schemas.trip import TripCreate, TripPreferenceIn, AIPlanABCResponse, AIPlanTier
from app.providers.gemini_provider import gemini_provider
from app.providers.travel_provider import travel_provider


class TripService:
    def create_trip(self, db: Session, user_id: str, req: TripCreate) -> Trip:
        # Calculate duration in days
        duration = max(1, (req.end_date - req.start_date).days + 1)

        trip = Trip(
            creator_id=user_id,
            title=req.title,
            primary_destination=req.primary_destination,
            destinations=req.destinations or [req.primary_destination],
            start_date=req.start_date,
            end_date=req.end_date,
            duration_days=duration,
            travelers_count=req.travelers_count,
            trip_type=req.trip_type,
            total_budget=req.total_budget,
            currency=req.currency,
            status="Planning"
        )
        db.add(trip)
        db.flush()

        # Add creator as primary organizer
        member = TripMember(
            trip_id=trip.id,
            user_id=user_id,
            role="organizer",
            status="accepted",
            budget_contribution=req.total_budget
        )
        db.add(member)

        # Save preferences including transport exclusions ("No Flights")
        pref_data = req.preferences or TripPreferenceIn()
        pref = TripPreference(
            trip_id=trip.id,
            starting_location=pref_data.starting_location,
            interests=pref_data.interests,
            dietary_preferences=pref_data.dietary_preferences,
            accommodation_preferences=pref_data.accommodation_preferences,
            transport_preferences=pref_data.transport_preferences,
            excluded_transport=pref_data.excluded_transport,
            weather_preference=pref_data.weather_preference,
            accessibility_requirements=pref_data.accessibility_requirements,
            things_to_avoid=pref_data.things_to_avoid,
            custom_instructions=pref_data.custom_instructions
        )
        db.add(pref)
        db.commit()
        db.refresh(trip)
        return trip

    def generate_ai_plans(self, db: Session, trip_id: str) -> AIPlanABCResponse:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

        pref = db.query(TripPreference).filter(TripPreference.trip_id == trip_id).first()
        dest_record = db.query(Destination).filter(Destination.name.ilike(f"%{trip.primary_destination}%")).first()

        # Gather catalog data
        catalog_data = {
            "hotels": [],
            "transports": [],
            "activities": [],
            "restaurants": [],
            "agencies": []
        }

        if dest_record:
            catalog_data["hotels"] = [
                {"name": h.name, "stars": h.stars, "price_per_night": h.price_per_night, "amenities": h.amenities}
                for h in dest_record.hotels
            ]
            catalog_data["activities"] = [
                {"title": a.title, "duration_hours": a.duration_hours, "price": a.price, "location_name": a.location_name}
                for a in dest_record.experiences
            ]
            catalog_data["restaurants"] = [
                {"name": r.name, "cuisine": r.cuisine, "dietary": r.dietary_options, "price_range": r.price_range}
                for r in dest_record.restaurants
            ]
            catalog_data["agencies"] = [
                {"name": ag.name, "package_title": ag.package_title, "price": ag.price}
                for ag in dest_record.agencies
            ]

        # Multi-modal transport respecting exclusions (e.g., "No Flights")
        excluded = pref.excluded_transport if pref else []
        catalog_data["transports"] = travel_provider.search_transport(
            origin=pref.starting_location if pref else "New York",
            destination=trip.primary_destination,
            excluded_modes=excluded
        )

        user_prefs = {
            "primary_destination": trip.primary_destination,
            "total_budget": trip.total_budget,
            "currency": trip.currency,
            "duration_days": trip.duration_days,
            "travelers_count": trip.travelers_count,
            "excluded_transport": excluded,
            "dietary_preferences": pref.dietary_preferences if pref else ["Vegetarian"],
            "interests": pref.interests if pref else ["Sightseeing"]
        }

        plan_result = gemini_provider.plan_trip(user_prefs, catalog_data)
        plan_tiers = [AIPlanTier(**p) for p in plan_result["plans"]]

        return AIPlanABCResponse(
            trip_id=trip.id,
            primary_destination=trip.primary_destination,
            plans=plan_tiers
        )

    def select_and_build_itinerary(self, db: Session, trip_id: str, plan_tier: str) -> Itinerary:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

        # Invalidate old active itineraries
        db.query(Itinerary).filter(Itinerary.trip_id == trip_id).update({"is_active": False})

        dest = trip.primary_destination
        itinerary = Itinerary(
            trip_id=trip.id,
            title=f"{dest} Curated {plan_tier} Itinerary",
            plan_tier=plan_tier,
            total_cost=round(trip.total_budget * (0.65 if "A" in plan_tier else 0.85 if "B" in plan_tier else 1.1), 2),
            currency=trip.currency,
            summary=f"Tailored {plan_tier} exploration schedule maximizing curated experiences and cultural discoveries.",
            fit_rationale="Custom matched to user transit preferences, dietary habits, and pace.",
            is_active=True
        )
        db.add(itinerary)
        db.flush()

        # Build day-by-day Morning, Afternoon, Evening items
        dest_record = db.query(Destination).filter(Destination.name.ilike(f"%{dest}%")).first()
        activities = dest_record.experiences if dest_record else []
        restaurants = dest_record.restaurants if dest_record else []

        for day in range(1, trip.duration_days + 1):
            act_m = activities[(day * 3 - 3) % len(activities)] if activities else None
            act_a = activities[(day * 3 - 2) % len(activities)] if activities else None
            rest_e = restaurants[day % len(restaurants)] if restaurants else None

            # Morning Item
            item_m = ItineraryItem(
                itinerary_id=itinerary.id,
                day_number=day,
                time_slot="Morning",
                item_type="activity",
                title=act_m.title if act_m else f"{dest} Heritage & Scenic Walk",
                description=act_m.description if act_m else "Morning golden hour scenic discovery.",
                location_name=act_m.location_name if act_m else f"{dest} Old Quarter",
                start_time="09:00 AM",
                duration_minutes=150,
                cost=act_m.price if act_m else 25.0,
                transport_mode="Walk / Scenic Metro",
                weather_suitability="Ideal in clear/morning weather",
                order_index=(day - 1) * 3 + 1
            )
            db.add(item_m)

            # Afternoon Item
            item_a = ItineraryItem(
                itinerary_id=itinerary.id,
                day_number=day,
                time_slot="Afternoon",
                item_type="activity",
                title=act_a.title if act_a else f"{dest} Cultural & Artisan Workshop",
                description=act_a.description if act_a else "Immersive local arts and culinary masterclass.",
                location_name=act_a.location_name if act_a else f"{dest} Cultural Center",
                start_time="02:00 PM",
                duration_minutes=180,
                cost=act_a.price if act_a else 40.0,
                transport_mode="Local Electric Cab / Transit",
                weather_suitability="Indoor / Covered Pavilion",
                order_index=(day - 1) * 3 + 2
            )
            db.add(item_a)

            # Evening Item
            item_e = ItineraryItem(
                itinerary_id=itinerary.id,
                day_number=day,
                time_slot="Evening",
                item_type="restaurant",
                title=f"Sunset Dining at {rest_e.name if rest_e else f'{dest} Royal Terrace'}",
                description=f"Curated regional delicacies matching your dietary profile ({rest_e.cuisine if rest_e else 'Authentic Cuisine'}).",
                location_name=rest_e.address if rest_e else f"{dest} Waterfront",
                start_time="07:30 PM",
                duration_minutes=120,
                cost=rest_e.approx_cost_for_two if rest_e else 55.0,
                transport_mode="Private Chauffeur / Short Walk",
                weather_suitability="Al fresco or indoor dining",
                order_index=(day - 1) * 3 + 3
            )
            db.add(item_e)

        trip.status = "Decided"
        trip.current_estimated_cost = itinerary.total_cost
        trip.active_plan_id = itinerary.id
        db.commit()
        db.refresh(itinerary)
        return itinerary

    def complete_trip(self, db: Session, trip_id: str, user_id: str) -> Dict[str, Any]:
        """
        Completes the trip and triggers server-authoritative +500 NAVORA Coins reward!
        """
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

        trip.status = "Completed"

        # Award Coins
        wallet = db.query(CoinWallet).filter(CoinWallet.user_id == user_id).first()
        if not wallet:
            wallet = CoinWallet(user_id=user_id, balance=0, total_earned=0)
            db.add(wallet)
            db.flush()

        reward_amount = 500
        wallet.balance += reward_amount
        wallet.total_earned += reward_amount

        txn = CoinTransaction(
            wallet_id=wallet.id,
            transaction_type="EARNED",
            amount=reward_amount,
            balance_after=wallet.balance,
            reason=f"Trip Completion Reward: {trip.title}",
            reference_entity_type="trip",
            reference_entity_id=trip.id
        )
        db.add(txn)

        # Notify user
        notif = Notification(
            user_id=user_id,
            type="coin",
            severity="INFO",
            title="NAVORA Coins Earned! 🎉",
            message=f"You earned +500 NAVORA Coins for successfully completing your journey to {trip.primary_destination}. Use them on your next trip!",
            action_url="/coins"
        )
        db.add(notif)
        db.commit()

        return {
            "status": "success",
            "message": "Trip marked as Completed. +500 NAVORA Coins awarded to your wallet!",
            "new_coin_balance": wallet.balance,
            "coins_awarded": reward_amount
        }


trip_service = TripService()
