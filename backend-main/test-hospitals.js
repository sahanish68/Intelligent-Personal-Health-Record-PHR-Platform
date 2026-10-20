require('dotenv').config();
const axios = require('axios');

async function runDiagnostics() {
    console.log("=== STARTING DIAGNOSTICS ===");

    // 1. Check dot env Key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: GOOGLE_MAPS_API_KEY is not defined in .env!");
        return;
    }
    console.log("✅ GOOGLE_MAPS_API_KEY is present in .env (Length: " + apiKey.length + ")");

    // 2. Test IP API
    console.log("\n--- Testing IP Geolocation (ipapi.co) ---");
    let lat, lng;
    try {
        const ipResponse = await axios.get('https://ipapi.co/json/');
        lat = ipResponse.data.latitude;
        lng = ipResponse.data.longitude;
        console.log(`✅ IP Geolocation Success: ${lat}, ${lng} (${ipResponse.data.city}, ${ipResponse.data.country_name})`);
    } catch (err) {
        console.error("❌ IP Geolocation Failed:");
        if (err.response) {
            console.error(err.response.status, err.response.data);
        } else {
            console.error(err.message);
        }
        console.log("Using fallback coordinates (New York) for next test.");
        lat = 40.7128;
        lng = -74.0060;
    }

    // 3. Test Google Places API
    console.log("\n--- Testing Google Places API ---");
    const radius = 5000;
    const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${apiKey}`;

    try {
        const placesResponse = await axios.get(googleUrl);
        console.log(`Google API Status: ${placesResponse.data.status}`);

        if (placesResponse.data.status === "OK") {
            const resultsLength = placesResponse.data.results.length;
            console.log(`✅ Google Places Success: Found ${resultsLength} hospitals.`);
            if (resultsLength > 0) {
                console.log(`First hospital: ${placesResponse.data.results[0].name}`);
            }
        } else {
            console.error(`❌ Google Places API returned status: ${placesResponse.data.status}`);
            if (placesResponse.data.error_message) {
                console.error(`Error Message: ${placesResponse.data.error_message}`);
            }
        }
    } catch (err) {
        console.error("❌ Google Places Request completely failed:");
        console.error(err.message);
    }

    console.log("\n=== DIAGNOSTICS COMPLETE ===");
}

runDiagnostics();
