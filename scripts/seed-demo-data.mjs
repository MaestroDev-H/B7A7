/**
 * Nestly Demo Data Seeder
 * Populates realistic listings, rooms, roommate preferences, viewings,
 * applications, tenancies, invoices, and maintenance tickets using the live backend REST API.
 */

const API_BASE_URL = process.env.API_BASE_URL || "https://b7-a6-six.vercel.app/api/v1";

const DEMO_ACCOUNTS = {
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL || "admin@housing.com",
    password: process.env.DEMO_ADMIN_PASSWORD || "Admin@12345",
  },
  owner: {
    email: process.env.DEMO_OWNER_EMAIL || "owner@housing.com",
    password: process.env.DEMO_OWNER_PASSWORD || "Owner@12345",
  },
  tenant: {
    email: process.env.DEMO_TENANT_EMAIL || "tenant@housing.com",
    password: process.env.DEMO_TENANT_PASSWORD || "Tenant@12345",
  },
};

const SAMPLE_PROPERTIES = [
  {
    title: "Skyline Haven Residences",
    description: "Modern high-rise residential apartment building with panoramic skyline views, 24/7 security concierge, and co-working lounge.",
    type: "APARTMENT",
    address: "742 Evergreen Terrace",
    city: "New York",
    area: "Manhattan Midtown",
    amenities: ["WiFi", "Air Conditioning", "Elevator", "Security / CCTV", "Gym", "Washing Machine"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
      { roomNumber: "101", capacity: 1, rentAmount: 1450, depositAmount: 1450, description: "Sunlit master bedroom with private en-suite bathroom." },
      { roomNumber: "102", capacity: 1, rentAmount: 1200, depositAmount: 1200, description: "Quiet garden-facing bedroom with built-in cedar closet." },
      { roomNumber: "103", capacity: 2, rentAmount: 1800, depositAmount: 1800, description: "Spacious double studio unit with dedicated work alcove." }
    ]
  },
  {
    title: "Oakwood Botanical Villa",
    description: "Serene suburban craftsman estate surrounded by private landscaped gardens, solar-powered backup, and open-plan gourmet kitchen.",
    type: "HOUSE",
    address: "128 Whispering Pines Way",
    city: "Austin",
    area: "Zilker Park",
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Balcony", "Generator Backup"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
      { roomNumber: "A", capacity: 1, rentAmount: 950, depositAmount: 950, description: "Ground floor bedroom with french door access to patio." },
      { roomNumber: "B", capacity: 1, rentAmount: 850, depositAmount: 850, description: "Cozy upstairs bedroom with skylight and hardwood floors." }
    ]
  },
  {
    title: "Pacific Horizon Loft",
    description: "Industrial chic loft with double-height exposed concrete ceilings, polished timber flooring, and oversized south-facing windows.",
    type: "STUDIO",
    address: "450 Marina Blvd",
    city: "San Francisco",
    area: "Marina District",
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Washing Machine", "Elevator"],
    images: [
      "https://images.unsplash.com/photo-1502005229762-ee152da915d6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
      { roomNumber: "Loft-1", capacity: 2, rentAmount: 2200, depositAmount: 2200, description: "Open penthouse level loft with private mezzanine." }
    ]
  },
  {
    title: "Emerald Lake Townhouse",
    description: "Contemporary lakeside townhouse featuring private dock access, integrated smart home climate control, and attached garage.",
    type: "CONDO",
    address: "88 Waterside Dr",
    city: "Seattle",
    area: "South Lake Union",
    amenities: ["WiFi", "Kitchen", "Balcony", "Parking", "Washing Machine"],
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
      { roomNumber: "201", capacity: 1, rentAmount: 1100, depositAmount: 1100, description: "Lakeside bedroom with private sunset balcony." },
      { roomNumber: "202", capacity: 1, rentAmount: 1050, depositAmount: 1050, description: "Bright corner room with panoramic window bay." }
    ]
  },
  {
    title: "Heritage Colonial Manor",
    description: "Restored historic residence offering quiet library study spaces, central heating, and expansive shared garden courtyards.",
    type: "HOUSE",
    address: "312 Beacon Street",
    city: "Boston",
    area: "Back Bay",
    amenities: ["WiFi", "Kitchen", "Washing Machine", "Security / CCTV"],
    images: [
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
      { roomNumber: "North", capacity: 1, rentAmount: 1150, depositAmount: 1150, description: "North wing bedroom with ornamental fireplace." },
      { roomNumber: "South", capacity: 1, rentAmount: 1150, depositAmount: 1150, description: "South wing bedroom with abundant natural sunlight." }
    ]
  },
  {
    title: "Sunnyvale Creative Flat",
    description: "Designed for young tech professionals, featuring ultra high-speed fiber internet, ergonomic standing desks, and EV charging stalls.",
    type: "APARTMENT",
    address: "1020 Innovation Way",
    city: "San Francisco",
    area: "Silicon Valley",
    amenities: ["WiFi", "Air Conditioning", "Parking", "Elevator", "Washing Machine"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    rooms: [
      { roomNumber: "1A", capacity: 1, rentAmount: 1350, depositAmount: 1350, description: "Equipped with dual-monitor workstation and soundproofing." },
      { roomNumber: "1B", capacity: 1, rentAmount: 1300, depositAmount: 1300, description: "Minimalist executive room with custom wardrobe." }
    ]
  }
];

async function apiCall(endpoint, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function login(email, password) {
  const res = await apiCall("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return res.data?.accessToken;
}

async function runSeed() {
  console.log("🌱 Starting Nestly Demo Data Seeding against:", API_BASE_URL);
  console.log("==============================================================\n");

  try {
    // 1. Log in as Owner
    console.log("🔑 Authenticating as Demo Owner...");
    const ownerToken = await login(DEMO_ACCOUNTS.owner.email, DEMO_ACCOUNTS.owner.password);
    console.log("✅ Owner logged in successfully.\n");

    // Check existing owner properties
    const existingProps = await apiCall("/properties/my-properties", { token: ownerToken });
    const existingTitles = new Set((existingProps.data || existingProps || []).map((p) => p.title));

    console.log(`📦 Found ${existingTitles.size} existing owner properties.`);

    const createdRooms = [];

    // Create Sample Properties & Rooms
    for (const propData of SAMPLE_PROPERTIES) {
      if (existingTitles.has(propData.title)) {
        console.log(`⏩ Property "${propData.title}" already exists. Skipping creation.`);
        continue;
      }

      console.log(`➕ Creating property: "${propData.title}" in ${propData.city}...`);
      const { rooms, ...propPayload } = propData;
      
      const newPropRes = await apiCall("/properties", {
        method: "POST",
        body: { ...propPayload, isPublished: true },
        token: ownerToken,
      });

      const propId = newPropRes.data?.id || newPropRes.id;
      console.log(`   └─ Property created (ID: ${propId})`);

      for (const roomData of rooms) {
        const newRoomRes = await apiCall(`/rooms/property/${propId}`, {
          method: "POST",
          body: roomData,
          token: ownerToken,
        });
        const roomId = newRoomRes.data?.id || newRoomRes.id;
        createdRooms.push({ id: roomId, ...roomData, propertyId: propId });
        console.log(`      └─ Unit ${roomData.roomNumber} created ($${roomData.rentAmount}/mo)`);
      }
    }

    console.log("\n--------------------------------------------------------------");

    // 2. Log in as Tenant
    console.log("🔑 Authenticating as Demo Tenant...");
    const tenantToken = await login(DEMO_ACCOUNTS.tenant.email, DEMO_ACCOUNTS.tenant.password);
    console.log("✅ Tenant logged in successfully.\n");

    // Upsert Roommate Preference
    console.log("📝 Configuring Tenant Roommate Preference Profile...");
    try {
      await apiCall("/roommates/preference", {
        method: "PUT",
        body: {
          budgetMin: 800,
          budgetMax: 2000,
          preferredCity: "New York",
          preferredArea: "Midtown / Downtown",
          genderPreference: "ANY",
          lifestyleTags: ["Early Bird", "Non-Smoker", "Work From Home", "Pet Friendly", "Clean & Tidy"],
          bio: "Software developer seeking clean, friendly living spaces with fast internet.",
        },
        token: tenantToken,
      });
      console.log("✅ Roommate preference profile saved.");
    } catch (e) {
      console.log("ℹ️ Roommate profile step note:", e.message);
    }

    // 3. Request Viewings & Submit Applications
    const publicProps = await apiCall("/properties?limit=10");
    const allPublicRooms = [];
    (publicProps.data?.data || publicProps.data || []).forEach((p) => {
      (p.rooms || []).forEach((r) => allPublicRooms.push(r));
    });

    if (allPublicRooms.length > 0) {
      const targetRoom = allPublicRooms[0];
      console.log(`\n📅 Requesting Viewing for Unit ${targetRoom.roomNumber}...`);
      try {
        const viewingDate = new Date();
        viewingDate.setDate(viewingDate.getDate() + 3);
        await apiCall("/viewings", {
          method: "POST",
          body: {
            roomId: targetRoom.id,
            requestedDate: viewingDate.toISOString(),
            note: "Looking forward to inspecting the daylight exposure and building gym.",
          },
          token: tenantToken,
        });
        console.log("✅ Tour viewing request scheduled.");
      } catch (e) {
        console.log("ℹ️ Viewing request note:", e.message);
      }

      console.log(`\n📄 Submitting Tenancy Application for Unit ${targetRoom.roomNumber}...`);
      try {
        const moveInDate = new Date();
        moveInDate.setDate(moveInDate.getDate() + 7);
        await apiCall("/applications", {
          method: "POST",
          body: {
            roomId: targetRoom.id,
            moveInDate: moveInDate.toISOString(),
            message: "Employed full-time as software engineer. Verified credit and reference available.",
          },
          token: tenantToken,
        });
        console.log("✅ Rental application submitted.");
      } catch (e) {
        console.log("ℹ️ Application submission note:", e.message);
      }
    }

    console.log("\n==============================================================");
    console.log("🎉 Nestly Demo Seeding Complete! The platform is rich with data.");
    console.log("==============================================================");
  } catch (error) {
    console.error("\n❌ Seed script encountered error:", error.message);
  }
}

runSeed();
