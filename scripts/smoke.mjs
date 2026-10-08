import fs from "node:fs";
import path from "node:path";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [k, ...v] = trimmed.split("=");
      if (k && v.length > 0 && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
} catch {
  // Ignore env read error
}

const API_BASE_URL = (process.env.API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

const DEMO_CREDENTIALS = {
  ADMIN: {
    email: process.env.DEMO_ADMIN_EMAIL || "admin@housing.com",
    password: process.env.DEMO_ADMIN_PASSWORD || "Admin@12345",
  },
  OWNER: {
    email: process.env.DEMO_OWNER_EMAIL || "owner@housing.com",
    password: process.env.DEMO_OWNER_PASSWORD || "Owner@12345",
  },
  TENANT: {
    email: process.env.DEMO_TENANT_EMAIL || "tenant@housing.com",
    password: process.env.DEMO_TENANT_PASSWORD || "Tenant@12345",
  },
};

const results = [];

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message, data: null };
  }
}

async function runSmokeTest() {
  console.log(`\n🔍 Nestly Backend Smoke Test`);
  console.log(`📡 Target API: ${API_BASE_URL}\n`);

  let sampleProperty = null;
  let sampleInvoice = null;
  let sampleTenancy = null;

  // 1. GET /properties
  const propRes = await request("/properties?limit=5");
  const propPass = propRes.ok && propRes.data?.success && Array.isArray(propRes.data?.data);
  results.push({
    Check: "GET /properties",
    Status: propPass ? "✅ PASS" : "❌ FAIL",
    Details: propPass
      ? `Received ${propRes.data.data.length} items (Total: ${propRes.data.meta?.total ?? "N/A"})`
      : `HTTP ${propRes.status}: ${propRes.data?.message || propRes.error || "Failed"}`,
  });
  if (propPass && propRes.data.data.length > 0) {
    sampleProperty = propRes.data.data[0];
  }

  // 2. Logins
  const tokens = {};
  const refreshTokens = {};

  for (const [role, creds] of Object.entries(DEMO_CREDENTIALS)) {
    const loginRes = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(creds),
    });
    const loginPass = loginRes.ok && loginRes.data?.success && loginRes.data?.data?.accessToken;
    results.push({
      Check: `Login ${role} (${creds.email})`,
      Status: loginPass ? "✅ PASS" : "❌ FAIL",
      Details: loginPass
        ? `Logged in as ${loginRes.data.data.user?.role}`
        : `HTTP ${loginRes.status}: ${loginRes.data?.message || loginRes.error}`,
    });

    if (loginPass) {
      tokens[role] = loginRes.data.data.accessToken;
      refreshTokens[role] = loginRes.data.data.refreshToken;

      // 3. GET /users/me
      const meRes = await request("/users/me", {
        headers: { Authorization: `Bearer ${tokens[role]}` },
      });
      const mePass = meRes.ok && meRes.data?.success && meRes.data?.data?.role === role;
      results.push({
        Check: `GET /users/me (${role})`,
        Status: mePass ? "✅ PASS" : "❌ FAIL",
        Details: mePass
          ? `Verified ID: ${meRes.data.data.id}`
          : `HTTP ${meRes.status}: ${meRes.data?.message || meRes.error}`,
      });
    }
  }

  // 4. Admin dashboard stats
  if (tokens.ADMIN) {
    const adminRes = await request("/admin/dashboard-stats", {
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    const adminPass = adminRes.ok && adminRes.data?.success && adminRes.data?.data;
    results.push({
      Check: "GET /admin/dashboard-stats",
      Status: adminPass ? "✅ PASS" : "❌ FAIL",
      Details: adminPass
        ? `Users: ${adminRes.data.data.totalUsers}, Properties: ${adminRes.data.data.totalProperties}`
        : `HTTP ${adminRes.status}: ${adminRes.data?.message || adminRes.error}`,
    });
  }

  // 5. Owner properties
  if (tokens.OWNER) {
    const ownerRes = await request("/properties/my-properties", {
      headers: { Authorization: `Bearer ${tokens.OWNER}` },
    });
    const ownerPass = ownerRes.ok && ownerRes.data?.success && Array.isArray(ownerRes.data?.data);
    results.push({
      Check: "GET /properties/my-properties",
      Status: ownerPass ? "✅ PASS" : "❌ FAIL",
      Details: ownerPass
        ? `Found ${ownerRes.data.data.length} properties`
        : `HTTP ${ownerRes.status}: ${ownerRes.data?.message || ownerRes.error}`,
    });
  }

  // 6. Tenant invoices & tenancies
  if (tokens.TENANT) {
    const invRes = await request("/tenancies/my-invoices", {
      headers: { Authorization: `Bearer ${tokens.TENANT}` },
    });
    const invPass = invRes.ok && invRes.data?.success && Array.isArray(invRes.data?.data);
    results.push({
      Check: "GET /tenancies/my-invoices",
      Status: invPass ? "✅ PASS" : "❌ FAIL",
      Details: invPass
        ? `Found ${invRes.data.data.length} invoices`
        : `HTTP ${invRes.status}: ${invRes.data?.message || invRes.error}`,
    });
    if (invPass && invRes.data.data.length > 0) {
      sampleInvoice = invRes.data.data[0];
    }

    const tenRes = await request("/tenancies/my-tenancies", {
      headers: { Authorization: `Bearer ${tokens.TENANT}` },
    });
    const tenPass = tenRes.ok && tenRes.data?.success && Array.isArray(tenRes.data?.data);
    results.push({
      Check: "GET /tenancies/my-tenancies",
      Status: tenPass ? "✅ PASS" : "❌ FAIL",
      Details: tenPass
        ? `Found ${tenRes.data.data.length} tenancies`
        : `HTTP ${tenRes.status}: ${tenRes.data?.message || tenRes.error}`,
    });
    if (tenPass && tenRes.data.data.length > 0) {
      sampleTenancy = tenRes.data.data[0];
    }
  }

  // 7. Refresh token rotation test
  if (refreshTokens.TENANT) {
    const oldRefreshToken = refreshTokens.TENANT;
    const refreshRes1 = await request("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: oldRefreshToken }),
    });

    const refresh1Pass = refreshRes1.ok && refreshRes1.data?.success && refreshRes1.data?.data?.accessToken;

    // The old refresh token must now FAIL because rotation invalidates previous tokens
    const refreshRes2 = await request("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: oldRefreshToken }),
    });
    const rotationPass = refresh1Pass && (!refreshRes2.ok || !refreshRes2.data?.success);

    results.push({
      Check: "POST /auth/refresh-token (rotation)",
      Status: rotationPass ? "✅ PASS" : "❌ FAIL",
      Details: rotationPass
        ? "Rotated successfully; old refresh token is now invalid"
        : `Expected rejection of old token, but got HTTP ${refreshRes2.status}`,
    });
  }

  // Output table
  console.table(results);

  console.log("\n📦 Sample JSON Shapes:\n");
  if (sampleProperty) {
    console.log("Sample Property:", JSON.stringify(sampleProperty, null, 2));
  } else {
    console.log("Sample Property: [No items found in GET /properties]");
  }

  if (sampleInvoice) {
    console.log("Sample Invoice:", JSON.stringify(sampleInvoice, null, 2));
  } else {
    console.log("Sample Invoice: [No items found in GET /tenancies/my-invoices]");
  }

  if (sampleTenancy) {
    console.log("Sample Tenancy:", JSON.stringify(sampleTenancy, null, 2));
  } else {
    console.log("Sample Tenancy: [No items found in GET /tenancies/my-tenancies]");
  }
}

runSmokeTest();
