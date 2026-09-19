"""
NAVORA Worldwide Seed Data — Comprehensive Indian & International Portfolio.
Seeds destinations, experiences, hotels, restaurants, agencies, and transit.
"""
import logging

logger = logging.getLogger("navora.seed")


def seed_demo_data(db) -> None:
    """Seed worldwide demo destinations, hotels, restaurants, experiences, and agencies."""
    from app.models.catalog import Destination, Experience, Hotel, Restaurant, Agency, TransportOption
    from app.models.auth import User, Profile
    from app.models.reward import CoinWallet
    from app.core.security import get_password_hash

    # Ensure default verified demo users exist
    demo_user = db.query(User).filter(User.email == "demo@navora.ai").first()
    if not demo_user:
        demo_user = User(
            id="usr-demo-001",
            email="demo@navora.ai",
            phone="+15551234567",
            hashed_password=get_password_hash("NavoraDemo2026!"),
            full_name="Alexander Vance",
            is_active=True,
            is_verified=True,
            is_2fa_enabled=False
        )
        db.add(demo_user)
        db.flush()

        profile = Profile(
            user_id=demo_user.id,
            home_city="San Francisco",
            home_country="United States",
            preferred_currency="USD",
            preferred_language="en",
            bio="Luxury & cultural architecture explorer.",
            travel_styles=["Luxury", "Culture", "Culinary"],
            dietary_preferences=["Pescatarian"],
            interests=["Architecture", "Fine Dining", "Modern Art"]
        )
        db.add(profile)

        wallet = CoinWallet(
            user_id=demo_user.id,
            balance=1500,
            total_earned=1500,
            total_redeemed=0
        )
        db.add(wallet)
        db.commit()
        logger.info("Seeded verified demo user: demo@navora.ai / NavoraDemo2026!")

    traveler_user = db.query(User).filter(User.email == "traveler@navora.ai").first()
    if not traveler_user:
        traveler_user = User(
            id="usr-traveler-001",
            email="traveler@navora.ai",
            phone="+15559876543",
            hashed_password=get_password_hash("NavoraDemo2026!"),
            full_name="Elena Rostova",
            is_active=True,
            is_verified=True,
            is_2fa_enabled=False
        )
        db.add(traveler_user)
        db.flush()

        traveler_profile = Profile(
            user_id=traveler_user.id,
            home_city="New York",
            home_country="United States",
            preferred_currency="USD",
            preferred_language="en",
            bio="Luxury traveler & global culinary enthusiast.",
            travel_styles=["Luxury", "Culinary", "Adventure"],
            dietary_preferences=[],
            interests=["Fine Dining", "Luxury Resorts", "Beach & Sun"]
        )
        db.add(traveler_profile)

        traveler_wallet = CoinWallet(
            user_id=traveler_user.id,
            balance=2500,
            total_earned=2500,
            total_redeemed=0
        )
        db.add(traveler_wallet)
        db.commit()
        logger.info("Seeded verified demo user: traveler@navora.ai / NavoraDemo2026!")

    destinations = [

        # ============ BEACHES (tag: "beaches") ============
        Destination(
            id="dest-goa", name="Goa", slug="goa-india",
            country="India", region="South-West India", continent="Asia",
            latitude=15.2993, longitude=74.1240,
            editorial_description="Sun-kissed Arabian Sea beaches, historic Portuguese villas, feni distilleries, and coastal slow living.",
            hero_image="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
            categories=["beaches"],
            best_season="November - March", ideal_duration_days=5,
            currency="INR", approx_budget_per_day=90.0,
            safety_score=8.5, is_demo_data=True
        ),
        Destination(
            id="dest-maldives", name="Maldives", slug="maldives",
            country="Maldives", region="South Asia", continent="Asia",
            latitude=3.2028, longitude=73.2207,
            editorial_description="Crystal-clear turquoise atolls, vibrant marine life, and private overwater villas — the ultimate luxury escape.",
            hero_image="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
            categories=["beaches"],
            best_season="November - April", ideal_duration_days=7,
            currency="USD", approx_budget_per_day=320.0,
            safety_score=9.0, is_demo_data=True
        ),
        Destination(
            id="dest-bora-bora", name="Bora Bora", slug="bora-bora",
            country="French Polynesia", region="Oceania", continent="Oceania",
            latitude=-16.5004, longitude=-151.7415,
            editorial_description="A tropical paradise with turquoise lagoons, coral reefs, and iconic overwater bungalows.",
            hero_image="https://images.unsplash.com/photo-1589394815804-964ce0fa5894?w=800",
            categories=["beaches"],
            best_season="May - October", ideal_duration_days=6,
            currency="XPF", approx_budget_per_day=300.0,
            safety_score=9.1, is_demo_data=True
        ),
        Destination(
            id="dest-santorini", name="Santorini", slug="santorini-greece",
            country="Greece", region="Europe", continent="Europe",
            latitude=36.3932, longitude=25.4615,
            editorial_description="White-washed cliffside villages, spectacular Aegean sunsets, and dramatic volcanic beaches.",
            hero_image="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5f1?w=800",
            categories=["beaches"],
            best_season="May - October", ideal_duration_days=5,
            currency="EUR", approx_budget_per_day=200.0,
            safety_score=8.9, is_demo_data=True
        ),
        Destination(
            id="dest-phuket", name="Phuket", slug="phuket-thailand",
            country="Thailand", region="Asia", continent="Asia",
            latitude=7.9519, longitude=98.3381,
            editorial_description="Tropical island paradise with crystal-clear Andaman Sea waters, white sand beaches and vibrant nightlife.",
            hero_image="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
            categories=["beaches"],
            best_season="November - April", ideal_duration_days=7,
            currency="THB", approx_budget_per_day=90.0,
            safety_score=8.0, is_demo_data=True
        ),

        # ============ MOUNTAINS (tag: "mountains") ============
        Destination(
            id="dest-kashmir", name="Kashmir", slug="kashmir-india",
            country="India", region="North India", continent="Asia",
            latitude=34.0837, longitude=74.7973,
            editorial_description="The Paradise on Earth — Dal Lake shikaras, pine-forested alpine valleys of Pahalgam, and snow-capped Gulmarg.",
            hero_image="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800",
            categories=["mountains"],
            best_season="April - October (Skiing Dec - Feb)", ideal_duration_days=6,
            currency="INR", approx_budget_per_day=85.0,
            safety_score=8.0, is_demo_data=True
        ),
        Destination(
            id="dest-swiss-alps", name="Swiss Alps", slug="swiss-alps-switzerland",
            country="Switzerland", region="Central Europe", continent="Europe",
            latitude=46.5599, longitude=7.9868,
            editorial_description="Soaring glacial summits, scenic cogwheel railways, alpine meadows, and luxury chalets under the Matterhorn.",
            hero_image="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
            categories=["mountains"],
            best_season="June - September (Skiing Dec - April)", ideal_duration_days=6,
            currency="CHF", approx_budget_per_day=260.0,
            safety_score=9.8, is_demo_data=True
        ),
        Destination(
            id="dest-banff", name="Banff", slug="banff-canada",
            country="Canada", region="North America", continent="North America",
            latitude=51.1784, longitude=-115.5708,
            editorial_description="Glacial turquoise lakes, majestic Rocky Mountain peaks, and iconic wildlife in Canada's oldest national park.",
            hero_image="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800",
            categories=["mountains"],
            best_season="June - August (Skiing Dec - March)", ideal_duration_days=5,
            currency="CAD", approx_budget_per_day=180.0,
            safety_score=9.6, is_demo_data=True
        ),
        Destination(
            id="dest-patagonia", name="Patagonia", slug="patagonia-argentina",
            country="Argentina", region="South America", continent="South America",
            latitude=-50.2190, longitude=-72.8711,
            editorial_description="Dramatic granite towers, immense glaciers, and crystal-clear lakes at the end of the world.",
            hero_image="https://images.unsplash.com/photo-1518182170546-076616fd4671?w=800",
            categories=["mountains"],
            best_season="November - March", ideal_duration_days=10,
            currency="ARS", approx_budget_per_day=120.0,
            safety_score=8.5, is_demo_data=True
        ),
        Destination(
            id="dest-queenstown", name="Queenstown", slug="queenstown-nz",
            country="New Zealand", region="Oceania", continent="Oceania",
            latitude=-45.0312, longitude=168.6626,
            editorial_description="The adventure capital of the world, nestled beside crystal-clear Lake Wakatipu surrounded by dramatic alpine ranges.",
            hero_image="https://images.unsplash.com/photo-1520697830682-89849ebeb6e9?w=800",
            categories=["mountains"],
            best_season="December - February", ideal_duration_days=6,
            currency="NZD", approx_budget_per_day=160.0,
            safety_score=9.4, is_demo_data=True
        ),

        # ============ SPIRITUAL (tag: "spiritual") ============
        Destination(
            id="dest-varanasi", name="Varanasi", slug="varanasi-india",
            country="India", region="North India", continent="Asia",
            latitude=25.3176, longitude=82.9739,
            editorial_description="The spiritual heart of India — ancient Ganga ghats, dawn boat rituals, evening Maha Aarti, and sacred silk weaving.",
            hero_image="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
            categories=["spiritual"],
            best_season="October - March", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=50.0,
            safety_score=8.3, is_demo_data=True
        ),
        Destination(
            id="dest-rishikesh", name="Rishikesh", slug="rishikesh-india",
            country="India", region="North India", continent="Asia",
            latitude=30.0869, longitude=78.2676,
            editorial_description="The Yoga Capital of the World — sacred Ganges, ashrams, meditation retreats, and white-water rafting.",
            hero_image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            categories=["spiritual"],
            best_season="September - November, February - May", ideal_duration_days=4,
            currency="INR", approx_budget_per_day=45.0,
            safety_score=8.7, is_demo_data=True
        ),
        Destination(
            id="dest-kyoto", name="Kyoto", slug="kyoto-japan",
            country="Japan", region="East Asia", continent="Asia",
            latitude=35.0116, longitude=135.7681,
            editorial_description="Ancient imperial capital with 1,600 Buddhist temples, zen gardens, geisha districts, and sacred Shinto shrines.",
            hero_image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
            categories=["spiritual"],
            best_season="March - May, October - November", ideal_duration_days=5,
            currency="JPY", approx_budget_per_day=130.0,
            safety_score=9.5, is_demo_data=True
        ),
        Destination(
            id="dest-amritsar", name="Amritsar", slug="amritsar-india",
            country="India", region="North India", continent="Asia",
            latitude=31.6340, longitude=74.8723,
            editorial_description="Home of the Golden Temple — the holiest Sikh shrine, with free langar, the Wagah Border ceremony, and Punjabi culture.",
            hero_image="https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800",
            categories=["spiritual"],
            best_season="October - March", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=40.0,
            safety_score=8.8, is_demo_data=True
        ),
        Destination(
            id="dest-tirupati", name="Tirupati", slug="tirupati-india",
            country="India", region="South India", continent="Asia",
            latitude=13.6288, longitude=79.4192,
            editorial_description="The richest temple in the world — Sri Venkateswara atop the Tirumala hills, drawing millions of devotees every year.",
            hero_image="https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800",
            categories=["spiritual"],
            best_season="September - February", ideal_duration_days=2,
            currency="INR", approx_budget_per_day=35.0,
            safety_score=8.9, is_demo_data=True
        ),

        # ============ HILL STATIONS (tag: "hill stations") ============
        Destination(
            id="dest-darjeeling", name="Darjeeling", slug="darjeeling-india",
            country="India", region="East India", continent="Asia",
            latitude=27.0410, longitude=88.2663,
            editorial_description="Queen of the Hills — sunrise over Kanchenjunga from Tiger Hill, toy train rides, and world-famous Darjeeling tea estates.",
            hero_image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            categories=["hill stations"],
            best_season="March - May, September - November", ideal_duration_days=4,
            currency="INR", approx_budget_per_day=55.0,
            safety_score=8.5, is_demo_data=True
        ),
        Destination(
            id="dest-ooty", name="Ooty", slug="ooty-india",
            country="India", region="South India", continent="Asia",
            latitude=11.4102, longitude=76.6950,
            editorial_description="The Queen of Hill Stations in the Nilgiri mountains — eucalyptus forests, Botanical Gardens, and the scenic Nilgiri Mountain Railway.",
            hero_image="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            categories=["hill stations"],
            best_season="October - June", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=50.0,
            safety_score=9.0, is_demo_data=True
        ),
        Destination(
            id="dest-coorg", name="Coorg", slug="coorg-india",
            country="India", region="South India", continent="Asia",
            latitude=12.3375, longitude=75.8069,
            editorial_description="Scotland of India — endless coffee and spice plantations, misty valleys, Abbey Falls, and tribal Kodava culture.",
            hero_image="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800",
            categories=["hill stations"],
            best_season="October - May", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=60.0,
            safety_score=9.1, is_demo_data=True
        ),
        Destination(
            id="dest-shimla", name="Shimla", slug="shimla-india",
            country="India", region="North India", continent="Asia",
            latitude=31.1048, longitude=77.1734,
            editorial_description="The Summer Capital of British India — colonial architecture on the Mall Road, apple orchards, and panoramic Himalayan vistas.",
            hero_image="https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800",
            categories=["hill stations"],
            best_season="March - June, September - November", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=65.0,
            safety_score=8.6, is_demo_data=True
        ),
        Destination(
            id="dest-munnar", name="Munnar", slug="munnar-india",
            country="India", region="South India", continent="Asia",
            latitude=10.0889, longitude=77.0595,
            editorial_description="A high-altitude paradise in Kerala — endless emerald tea plantations, misty Eravikulam National Park, and cool Anamudi peaks.",
            hero_image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
            categories=["hill stations"],
            best_season="September - March", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=55.0,
            safety_score=9.2, is_demo_data=True
        ),

        # ============ WILDLIFE (tag: "wildlife") ============
        Destination(
            id="dest-serengeti", name="Serengeti", slug="serengeti-tanzania",
            country="Tanzania", region="Africa", continent="Africa",
            latitude=-2.3333, longitude=34.8333,
            editorial_description="Witness the Great Migration of 2 million wildebeest and spot the Big Five in Africa's most iconic national park.",
            hero_image="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
            categories=["wildlife"],
            best_season="June - October", ideal_duration_days=7,
            currency="USD", approx_budget_per_day=450.0,
            safety_score=7.0, is_demo_data=True
        ),
        Destination(
            id="dest-ranthambore", name="Ranthambore", slug="ranthambore-india",
            country="India", region="North India", continent="Asia",
            latitude=26.0173, longitude=76.5026,
            editorial_description="India's most famous tiger reserve — dramatic fort ruins, ancient lakes, and Bengal tigers in their natural habitat.",
            hero_image="https://images.unsplash.com/photo-1549366021-9f761d450615?w=800",
            categories=["wildlife"],
            best_season="October - June", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=120.0,
            safety_score=8.5, is_demo_data=True
        ),
        Destination(
            id="dest-galapagos", name="Galapagos Islands", slug="galapagos-ecuador",
            country="Ecuador", region="South America", continent="South America",
            latitude=-0.9538, longitude=-90.9656,
            editorial_description="A volcanic archipelago with unique endemic species — giant tortoises, marine iguanas, and blue-footed boobies.",
            hero_image="https://images.unsplash.com/photo-1527771746979-450ec8263544?w=800",
            categories=["wildlife"],
            best_season="December - May", ideal_duration_days=8,
            currency="USD", approx_budget_per_day=350.0,
            safety_score=8.8, is_demo_data=True
        ),
        Destination(
            id="dest-kruger", name="Kruger National Park", slug="kruger-south-africa",
            country="South Africa", region="Africa", continent="Africa",
            latitude=-23.9884, longitude=31.5547,
            editorial_description="One of Africa's largest game reserves, offering exceptional Big Five sightings and luxury safari lodges.",
            hero_image="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
            categories=["wildlife"],
            best_season="May - September", ideal_duration_days=5,
            currency="ZAR", approx_budget_per_day=200.0,
            safety_score=7.5, is_demo_data=True
        ),
        Destination(
            id="dest-kaziranga", name="Kaziranga", slug="kaziranga-india",
            country="India", region="North-East India", continent="Asia",
            latitude=26.5775, longitude=93.1711,
            editorial_description="UNESCO World Heritage Site — home to the world's largest population of one-horned rhinoceroses and Bengal tigers.",
            hero_image="https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800",
            categories=["wildlife"],
            best_season="November - April", ideal_duration_days=3,
            currency="INR", approx_budget_per_day=100.0,
            safety_score=8.2, is_demo_data=True
        ),

    ]

    for d in destinations:
        db.merge(d)
    db.flush()

    # --- Curated Experiences ---
    experiences = [
        # Goa
        Experience(
            id="exp-goa-catamaran", destination_id="dest-goa",
            title="Private Sunset Catamaran Cruise & Champagne", category="Boating & Luxury",
            description="Sail into the golden Arabian Sea sunset past the historic Aguada Lighthouse with sommelier pairings.",
            price=65.0, currency="USD", duration_hours=2.5,
            image_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            location_name="Mandovi Marina, Panaji, Goa",
            tags=["beaches", "sunset", "luxury", "romantic"], rating=4.9, review_count=1240, is_demo_data=True
        ),
        Experience(
            id="exp-goa-heritage", destination_id="dest-goa",
            title="Old Goa Portuguese Architecture Walk", category="Heritage & Culture",
            description="Private guided exploration of Basilica of Bom Jesus and Sé Cathedral with licensed architectural historian.",
            price=25.0, currency="USD", duration_hours=3.0,
            image_url="https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
            location_name="Old Goa, Goa",
            tags=["heritage", "culture", "architecture"], rating=4.8, review_count=980, is_demo_data=True
        ),
        # Kashmir
        Experience(
            id="exp-kashmir-shikara", destination_id="dest-kashmir",
            title="Dawn Shikara Ride through Floating Flower Markets", category="Culture & Scenic",
            description="Glide across the glass-still waters of Dal Lake as artisans and flower vendors gather at sunrise.",
            price=20.0, currency="USD", duration_hours=2.0,
            image_url="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800",
            location_name="Dal Lake, Srinagar, Kashmir",
            tags=["nature", "romantic", "slow travel"], rating=5.0, review_count=2150, is_demo_data=True
        ),
        # Kerala
        Experience(
            id="exp-kerala-houseboat", destination_id="dest-kerala",
            title="Alleppey Private Backwater Houseboat Cruise", category="Scenic & Wellness",
            description="Drift through palm-fringed lagoons with a private onboard chef preparing authentic Karimeen fish and vegetarian delicacies.",
            price=85.0, currency="USD", duration_hours=5.0,
            image_url="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
            location_name="Vembanad Lake, Alleppey, Kerala",
            tags=["nature", "wellness", "romantic", "food"], rating=4.9, review_count=1840, is_demo_data=True
        ),
        # Varanasi
        Experience(
            id="exp-varanasi-aarti", destination_id="dest-varanasi",
            title="VIP Boat Vantage for Dashashwamedh Maha Aarti", category="Spiritual & Ritual",
            description="Exclusive riverfront boat seating directly facing the priests during the sacred evening fire worship ritual.",
            price=30.0, currency="USD", duration_hours=2.0,
            image_url="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
            location_name="Dashashwamedh Ghat, Varanasi",
            tags=["spiritual", "heritage", "iconic"], rating=4.9, review_count=3420, is_demo_data=True
        ),
        # Tokyo
        Experience(
            id="exp-tokyo-sushi", destination_id="dest-tokyo",
            title="Tsukiji & Toyosu Gastronomy Tour with Master Chef", category="Food & Culinary",
            description="Early morning market discovery and private sushi-making masterclass with a veteran Ginza chef.",
            price=75.0, currency="USD", duration_hours=3.5,
            image_url="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800",
            location_name="Chuo City, Tokyo",
            tags=["food", "culture", "luxury"], rating=4.9, review_count=4120, is_demo_data=True
        ),
        # Swiss Alps
        Experience(
            id="exp-swiss-glacier", destination_id="dest-swiss-alps",
            title="Matterhorn Glacier Paradise Cableway Excursion", category="Adventure & Nature",
            description="Ascend Europe's highest mountain railway station at 3,883m with 360-degree views of 38 alpine peaks.",
            price=95.0, currency="CHF", duration_hours=4.0,
            image_url="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
            location_name="Zermatt, Switzerland",
            tags=["mountains", "views", "adventure"], rating=4.9, review_count=2980, is_demo_data=True
        ),
    ]
    for exp in experiences:
        db.merge(exp)
    db.flush()

    # --- Curated Stays ---
    hotels = [
        # Goa
        Hotel(
            id="hotel-goa-taj", destination_id="dest-goa",
            name="Taj Fort Aguada Resort & Spa", stay_type="resort", stars=5,
            address="Sinquerim, Candolim, Goa 403515",
            latitude=15.4989, longitude=73.7667,
            amenities=["spa", "pool", "private-beach", "seafood-restaurant", "wifi", "butler"],
            price_per_night=280.0, currency="USD",
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            rating=4.9, review_count=4890, is_demo_data=True
        ),
        Hotel(
            id="hotel-goa-heritage-villa", destination_id="dest-goa",
            name="Fontainhas Heritage Boutique Villa", stay_type="villa", stars=4,
            address="Latin Quarter, Panaji, Goa",
            latitude=15.4965, longitude=73.8315,
            amenities=["breakfast", "garden", "wifi", "terrace", "espresso-bar"],
            price_per_night=110.0, currency="USD",
            image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            rating=4.7, review_count=1240, is_demo_data=True
        ),
        # Kashmir
        Hotel(
            id="hotel-kashmir-khiber", destination_id="dest-kashmir",
            name="The Khyber Himalayan Resort & Spa", stay_type="resort", stars=5,
            address="Gulmarg, Jammu & Kashmir 193403",
            latitude=34.0538, longitude=74.3805,
            amenities=["heated-pool", "spa", "mountain-views", "ski-concierge", "fine-dining"],
            price_per_night=320.0, currency="USD",
            image_url="https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800",
            rating=4.9, review_count=2310, is_demo_data=True
        ),
        # Kerala
        Hotel(
            id="hotel-kerala-kumarakom", destination_id="dest-kerala",
            name="Kumarakom Lake Resort", stay_type="resort", stars=5,
            address="Kumarakom North Post, Kottayam, Kerala 686566",
            latitude=9.6175, longitude=76.4300,
            amenities=["ayurveda-spa", "infinity-pool", "backwater-villas", "heritage-dining"],
            price_per_night=250.0, currency="USD",
            image_url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            rating=4.9, review_count=3120, is_demo_data=True
        ),
        # Tokyo
        Hotel(
            id="hotel-tokyo-peninsula", destination_id="dest-tokyo",
            name="The Peninsula Tokyo", stay_type="hotel", stars=5,
            address="1-8-1 Yurakucho, Chiyoda City, Tokyo",
            latitude=35.6748, longitude=139.7621,
            amenities=["spa", "indoor-pool", "michelin-dining", "concierge", "wifi"],
            price_per_night=620.0, currency="USD",
            image_url="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
            rating=4.8, review_count=2120, is_demo_data=True
        ),
        # Swiss Alps
        Hotel(
            id="hotel-swiss-mont-cervin", destination_id="dest-swiss-alps",
            name="Mont Cervin Palace Zermatt", stay_type="hotel", stars=5,
            address="Bahnhofstrasse 31, 3920 Zermatt, Switzerland",
            latitude=45.9765, longitude=7.7491,
            amenities=["matterhorn-views", "alpine-spa", "heated-pool", "fondue-stube"],
            price_per_night=540.0, currency="CHF",
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            rating=4.9, review_count=1890, is_demo_data=True
        ),
    ]
    for h in hotels:
        db.merge(h)
    db.flush()

    # --- Curated Restaurants ---
    restaurants = [
        # Goa
        Restaurant(
            id="rest-goa-fishermans", destination_id="dest-goa",
            name="The Fisherman's Wharf", cuisine="Goan Coastal & Vegetarian",
            dietary_options=["Vegetarian", "Seafood", "Gluten-Free"], price_range="$$$",
            approx_cost_for_two=45.0, currency="USD",
            address="At the Riverside, Salcette, Goa",
            rating=4.8, review_count=3920,
            image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            is_demo_data=True
        ),
        Restaurant(
            id="rest-goa-vinayak", destination_id="dest-goa",
            name="Vinayak Family Restaurant", cuisine="Traditional Goan Thali",
            dietary_options=["Vegetarian", "Vegan", "Local"], price_range="$$",
            approx_cost_for_two=20.0, currency="USD",
            address="Main Road, Assagao, Goa",
            rating=4.7, review_count=2410,
            image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            is_demo_data=True
        ),
        # Kashmir
        Restaurant(
            id="rest-kashmir-ahdoos", destination_id="dest-kashmir",
            name="Ahdoos Heritage Restaurant", cuisine="Kashmiri Wazwan & Vegetarian Rogan",
            dietary_options=["Vegetarian", "Halal", "Kashmiri"], price_range="$$$",
            approx_cost_for_two=35.0, currency="USD",
            address="Residency Road, Srinagar, Kashmir",
            rating=4.8, review_count=4100,
            image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            is_demo_data=True
        ),
        # Tokyo
        Restaurant(
            id="rest-tokyo-sukiyabashi", destination_id="dest-tokyo",
            name="Sukiyabashi Jiro Ginza", cuisine="Authentic Japanese Edomae",
            dietary_options=["Chef Omakase", "Fresh Catch"], price_range="$$$$",
            approx_cost_for_two=400.0, currency="USD",
            address="Tsukamoto Sogyo Bldg, Ginza, Tokyo",
            rating=4.9, review_count=1220,
            image_url="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800",
            is_demo_data=True
        ),
    ]
    for r in restaurants:
        db.merge(r)
    db.flush()

    # --- Tour Agencies ---
    agencies = [
        Agency(
            id="ag-goa-elite", destination_id="dest-goa",
            name="Goa Luxury Heritage Escapes", package_title="5-Day Coastal Connoisseur & Portuguese Heritage",
            price=480.0, currency="USD", duration_days=5,
            hotel_included=True, transport_included=True, guide_included=True,
            inclusions=["5-Star Beach Resort", "Private Chauffeur SUV", "Catamaran Charter", "All Heritage Entry Passes"],
            exclusions=["International Flights"],
            rating=4.9, review_count=142, is_demo_data=True
        ),
        Agency(
            id="ag-kashmir-alpine", destination_id="dest-kashmir",
            name="Kashmir Valley Royal Expeditions", package_title="6-Day Srinagar, Gulmarg & Pahalgam VIP Trail",
            price=540.0, currency="USD", duration_days=6,
            hotel_included=True, transport_included=True, guide_included=True,
            inclusions=["Luxury Houseboat & Alpine Resort", "Private 4x4 Chauffeur", "Gondola Phase 1 & 2 Passes"],
            exclusions=["Personal Ski Equipment Hire"],
            rating=4.9, review_count=210, is_demo_data=True
        ),
        Agency(
            id="ag-tokyo-zen", destination_id="dest-tokyo",
            name="Nippon Private Journeys", package_title="7-Day Tokyo Modernity & Kyoto Zen Sanctuaries",
            price=1250.0, currency="USD", duration_days=7,
            hotel_included=True, transport_included=True, guide_included=True,
            inclusions=["4-Star & 5-Star Boutique Hotels", "Shinkansen Green Car Passes", "Licensed Bilingual Guide"],
            exclusions=["International Airfare"],
            rating=5.0, review_count=320, is_demo_data=True
        ),
    ]
    for a in agencies:
        db.merge(a)

    db.commit()
    logger.info(
        f"Seeded {len(destinations)} destinations, {len(experiences)} experiences, "
        f"{len(hotels)} hotels, {len(restaurants)} restaurants, and {len(agencies)} agencies."
    )
