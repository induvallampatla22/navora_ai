from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.catalog import Destination, TransportOption, Hotel, Restaurant, Experience, Agency
from app.schemas.compare import CompareItemOut, CompareMatrixOut
from app.providers.travel_provider import travel_provider


class CompareService:
    def get_comparison_matrix(
        self,
        db: Session,
        destination_name: str,
        category_tab: str = "All",
        origin: str = "New York, USA",
        excluded_modes: List[str] = None
    ) -> CompareMatrixOut:
        dest_record = db.query(Destination).filter(Destination.name.ilike(f"%{destination_name}%")).first()

        items: List[CompareItemOut] = []

        # 1. Transport Options
        if category_tab.lower() in ["all", "transport"]:
            transports = travel_provider.search_transport(origin, destination_name, excluded_modes=excluded_modes or [])
            for t in transports:
                items.append(CompareItemOut(
                    id=t["id"],
                    category="transport",
                    name=t["sub_mode"] or t["mode"],
                    sub_title=f"{t['provider_name']} ({t['departure_time']} - {t['arrival_time']})",
                    price=float(t["price"]),
                    currency=t.get("currency", "USD"),
                    rating=float(t.get("comfort_rating", 4.5)),
                    duration=f"{t['duration_minutes'] // 60}h {t['duration_minutes'] % 60}m",
                    location=f"Transit from {origin}",
                    distance_km=None,
                    preference_match_score=float(t.get("preference_match", 90.0)),
                    budget_impact=t.get("budget_impact", "Balanced"),
                    cancellation_terms=t.get("cancellation_policy", "Standard refund policy"),
                    pros=["Direct connections", f"Low emissions: {t.get('co2_emissions_kg', 30)}kg CO2"] if t.get("transfers", 0) == 0 else ["Priced competitively"],
                    trade_offs=[f"{t.get('transfers', 0)} transfer required"] if t.get("transfers", 0) > 0 else ["Requires fixed scheduled departure"],
                    metadata={"mode": t["mode"], "co2": t.get("co2_emissions_kg")},
                    is_demo_data=t.get("is_demo_data", False)
                ))

        # 2. Stays / Hotels
        if category_tab.lower() in ["all", "stays"]:
            hotels = dest_record.hotels if dest_record else []
            if not hotels:
                # Dynamic fallback for arbitrary worldwide destination
                items.append(CompareItemOut(
                    id=f"hotel-demo-1-{destination_name}",
                    category="stays",
                    name=f"The Grand Heritage Resort & Spa, {destination_name}",
                    sub_title="5-Star Luxury Resort",
                    price=280.0,
                    currency="USD",
                    rating=4.9,
                    duration="Per Night",
                    location=f"Central Scenic Quarter, {destination_name}",
                    distance_km=1.2,
                    preference_match_score=96.0,
                    budget_impact="High",
                    cancellation_terms="Free cancellation up to 48 hours before check-in",
                    pros=["Breakfast & Private Spa Access included", "Exceptional reviews"],
                    trade_offs=["Premium pricing during weekends"],
                    metadata={"stars": 5, "amenities": ["Pool", "Spa", "Breakfast"]},
                    is_demo_data=True
                ))
                items.append(CompareItemOut(
                    id=f"hotel-demo-2-{destination_name}",
                    category="stays",
                    name=f"Boutique Garden Villa {destination_name}",
                    sub_title="4-Star Boutique Stay",
                    price=140.0,
                    currency="USD",
                    rating=4.7,
                    duration="Per Night",
                    location=f"Old Town District, {destination_name}",
                    distance_km=0.6,
                    preference_match_score=92.0,
                    budget_impact="Balanced",
                    cancellation_terms="Free cancellation up to 24 hours prior",
                    pros=["Walking distance to cultural landmarks", "Locally roasted morning espresso included"],
                    trade_offs=["Limited private parking"],
                    metadata={"stars": 4, "amenities": ["Wifi", "Garden", "Breakfast"]},
                    is_demo_data=True
                ))
            else:
                for h in hotels:
                    items.append(CompareItemOut(
                        id=h.id,
                        category="stays",
                        name=h.name,
                        sub_title=f"{h.stars}-Star {h.stay_type.capitalize()}",
                        price=float(h.price_per_night),
                        currency=h.currency,
                        rating=float(h.rating),
                        duration="Per Night",
                        location=h.address,
                        distance_km=1.2,
                        preference_match_score=float(h.preference_match),
                        budget_impact="High" if h.price_per_night > 250 else "Balanced" if h.price_per_night > 120 else "Low",
                        cancellation_terms="Free cancellation up to 48 hours before check-in" if h.free_cancellation else "Non-refundable rate",
                        pros=["Breakfast included" if h.has_breakfast else "Prime central location", "Verified guest favorite"],
                        trade_offs=["Higher rate during peak holiday season" if h.price_per_night > 200 else "Standard city view rooms"],
                        metadata={"amenities": h.amenities, "stars": h.stars},
                        is_demo_data=h.is_demo_data
                    ))

        # 3. Activities / Experiences
        if category_tab.lower() in ["all", "activities"]:
            experiences = dest_record.experiences if dest_record else []
            if not experiences:
                items.append(CompareItemOut(
                    id=f"exp-demo-1-{destination_name}",
                    category="activities",
                    name=f"Private Sunset Coastal & Cultural Cruise",
                    sub_title=f"Scenic Tour • {destination_name}",
                    price=75.0,
                    currency="USD",
                    rating=4.9,
                    duration="3.0 hours",
                    location=destination_name,
                    distance_km=2.0,
                    preference_match_score=95.0,
                    budget_impact="Balanced",
                    cancellation_terms="Free cancellation up to 24h prior",
                    pros=["Skip-the-line VIP access", "Private champagne & local delicacies"],
                    trade_offs=["Advance reservation required"],
                    metadata={"tags": ["culture", "views", "luxury"]},
                    is_demo_data=True
                ))
            else:
                for exp in experiences:
                    items.append(CompareItemOut(
                        id=exp.id,
                        category="activities",
                        name=exp.title,
                        sub_title=f"{exp.category} • {exp.location_name}",
                        price=float(exp.price),
                        currency=exp.currency,
                        rating=float(exp.rating),
                        duration=f"{exp.duration_hours} hours",
                        location=exp.location_name,
                        distance_km=2.4,
                        preference_match_score=94.0,
                        budget_impact="Low" if exp.price < 50 else "Balanced",
                        cancellation_terms="Free cancellation up to 24h before activity",
                        pros=["Local licensed storyteller", "Skip-the-line express admission"],
                        trade_offs=["Advance booking recommended", "Weather dependent if outdoors"],
                        metadata={"tags": exp.tags},
                        is_demo_data=exp.is_demo_data
                    ))

        # 4. Restaurants / Dining
        if category_tab.lower() in ["all", "restaurants"]:
            restaurants = dest_record.restaurants if dest_record else []
            if not restaurants:
                items.append(CompareItemOut(
                    id=f"rest-demo-1-{destination_name}",
                    category="restaurants",
                    name=f"La Terrace Michelin Gourmet, {destination_name}",
                    sub_title="Fine Dining Contemporary ($$$$)",
                    price=90.0,
                    currency="USD",
                    rating=4.9,
                    duration="Avg 2h dining",
                    location=f"Waterfront Promenade, {destination_name}",
                    distance_km=0.8,
                    preference_match_score=98.0,
                    budget_impact="Balanced",
                    cancellation_terms="Table held for 20 minutes",
                    pros=["Vegetarian & Vegan tasting menus available", "Panoramic sunset terrace views"],
                    trade_offs=["Smart casual dress code strictly enforced"],
                    metadata={"cuisine": "Fine Dining", "dietary": ["Vegetarian", "Vegan"]},
                    is_demo_data=True
                ))
            else:
                for r in restaurants:
                    items.append(CompareItemOut(
                        id=r.id,
                        category="restaurants",
                        name=r.name,
                        sub_title=f"{r.cuisine} Cuisine ({r.price_range})",
                        price=float(r.approx_cost_for_two),
                        currency=r.currency,
                        rating=float(r.rating),
                        duration="Avg 1.5h dining",
                        location=r.address,
                        distance_km=0.8,
                        preference_match_score=96.0,
                        budget_impact="Balanced",
                        cancellation_terms="Table held for 15 minutes",
                        pros=[f"Dietary verified: {', '.join(r.dietary_options)}", "Chef's signature tasting menu"],
                        trade_offs=["Reservations essential for dinner terrace"],
                        metadata={"cuisine": r.cuisine, "dietary": r.dietary_options},
                        is_demo_data=r.is_demo_data
                    ))

        # 5. Tour Agencies / Packages
        if category_tab.lower() in ["all", "agencies"]:
            agencies = dest_record.agencies if dest_record else []
            if not agencies:
                items.append(CompareItemOut(
                    id=f"ag-demo-1-{destination_name}",
                    category="agencies",
                    name=f"Elite Horizons Travel Specialists",
                    sub_title=f"4-Day VIP All-Inclusive Package — {destination_name}",
                    price=580.0,
                    currency="USD",
                    rating=4.8,
                    duration="4 Days Full Package",
                    location=destination_name,
                    distance_km=None,
                    preference_match_score=91.0,
                    budget_impact="Balanced",
                    cancellation_terms="Free cancellation up to 7 days before departure",
                    pros=["Dedicated bilingual concierge & private transfers", "Handpicked 5-star accommodations"],
                    trade_offs=["Pre-set itinerary with morning departures"],
                    metadata={"inclusions": ["Hotel", "Private Chauffeur", "VIP Admissions"], "exclusions": ["International flights"]},
                    is_demo_data=True
                ))
            else:
                for ag in agencies:
                    items.append(CompareItemOut(
                        id=ag.id,
                        category="agencies",
                        name=ag.name,
                        sub_title=ag.package_title,
                        price=float(ag.price),
                        currency=ag.currency,
                        rating=float(ag.rating),
                        duration=f"{ag.duration_days} Days Full Package",
                        location=destination_name,
                        distance_km=None,
                        preference_match_score=89.0,
                        budget_impact="High" if ag.price > 600 else "Balanced",
                        cancellation_terms="50% deposit refundable up to 7 days prior",
                        pros=["Full guide & transport bundled", "Zero hassle planning"],
                        trade_offs=["Fixed schedule pace", "Less flexibility for spontaneous detours"],
                        metadata={"inclusions": ag.inclusions, "exclusions": ag.exclusions},
                        is_demo_data=True
                    ))


        explanation = (
            f"Comparing verified options for {destination_name}. Rather than declaring a single 'best', "
            f"NAVORA highlights trade-offs: High-speed rail saves on airport transfer friction while staying under budget; "
            f"Boutique stays offer prime walkability over outlying luxury resorts."
        )

        return CompareMatrixOut(
            destination=destination_name,
            active_tab=category_tab,
            items=items,
            summary=f"Found {len(items)} curated comparison entries across {category_tab}.",
            trade_off_explanation=explanation
        )


compare_service = CompareService()
