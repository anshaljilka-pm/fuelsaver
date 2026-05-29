import { useState } from "react"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "16px",
}

function getDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function App() {
  const [location, setLocation] = useState("")
  const [radius, setRadius] = useState(5)
  const [sortBy, setSortBy] = useState("cheapest")
  const [coords, setCoords] = useState(null)
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  })

  const fetchStations = (center) => {
    if (!window.google) return

    setLoading(true)
    setHasSearched(true)

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    )

    service.nearbySearch(
      {
        location: center,
        radius: radius * 1609.34,
        type: "gas_station",
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const mapped = results.map((place, index) => {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            const distance = getDistanceMiles(center.lat, center.lng, lat, lng)

            return {
              id: place.place_id || index,
              name: place.name,
              address: place.vicinity,
              lat,
              lng,
              distance,
              price: Number((2.85 + Math.random() * 0.7).toFixed(2)),
              rating: place.rating || null,
              reviews: place.user_ratings_total || 0,
              openNow: place.opening_hours?.open_now,
            }
          })

          setStations(mapped)
        } else {
          setStations([])
        }

        setLoading(false)
      }
    )
  }

  const searchByZip = () => {
    if (!location.trim()) {
      alert("Enter a ZIP code or city")
      return
    }

    const geocoder = new window.google.maps.Geocoder()
    setLoading(true)
    setHasSearched(true)

    geocoder.geocode(
      {
        address: location,
        componentRestrictions: { country: "US" },
      },
      (results, status) => {
        if (status === "OK") {
          const lat = results[0].geometry.location.lat()
          const lng = results[0].geometry.location.lng()
          const center = { lat, lng }

          setCoords(center)
          fetchStations(center)
        } else {
          setStations([])
          setLoading(false)
        }
      }
    )
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported")
      return
    }

    setLoading(true)
    setHasSearched(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setLocation("Current Location")
        setCoords(center)
        fetchStations(center)
      },
      () => {
        alert("Unable to get current location")
        setLoading(false)
      }
    )
  }

  const sortedStations = [...stations].sort((a, b) =>
    sortBy === "cheapest" ? a.price - b.price : a.distance - b.distance
  )

  const cheapestStation = [...stations].sort((a, b) => a.price - b.price)[0]
  const highestPrice = stations.length
    ? Math.max(...stations.map((s) => s.price))
    : 0
  const savingsPerGallon = cheapestStation
    ? (highestPrice - cheapestStation.price).toFixed(2)
    : "0.00"
  const fillUpSavings = cheapestStation
    ? ((highestPrice - cheapestStation.price) * 15).toFixed(2)
    : "0.00"

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-green-400">FuelSaver</h1>
        <p className="text-zinc-400 mt-2 mb-6">
          Find affordable gas near you
        </p>

        <div className="bg-zinc-900 rounded-2xl p-4 mb-5 border border-zinc-800">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter ZIP code or city"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-3 text-white outline-none"
          />

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-3 text-white"
          >
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={25}>25 miles</option>
          </select>

          <button
            onClick={searchByZip}
            className="w-full bg-green-500 hover:bg-green-400 rounded-xl py-3 font-semibold text-black"
          >
            {loading ? "⛽ Finding nearby stations..." : "Find Gas Stations"}
          </button>

          <button
            onClick={useCurrentLocation}
            className="w-full mt-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl py-3 font-medium text-zinc-200"
          >
            Use My Current Location
          </button>
        </div>

        {isLoaded && coords && (
          <div className="mb-5">
            <GoogleMap mapContainerStyle={containerStyle} center={coords} zoom={12}>
              <Marker position={coords} />
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={{ lat: station.lat, lng: station.lng }}
                />
              ))}
            </GoogleMap>
          </div>
        )}

        {stations.length > 0 && cheapestStation && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-5">
            <p className="text-sm text-zinc-400">Cheapest nearby</p>
            <p className="font-semibold text-green-300">
              {cheapestStation.name} • ${cheapestStation.price.toFixed(2)}/gal
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Save up to ${savingsPerGallon}/gal, about ${fillUpSavings} on a 15-gal fill-up.
            </p>
          </div>
        )}

        {stations.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy("cheapest")}
              className={`flex-1 rounded-xl py-2 font-medium ${
                sortBy === "cheapest"
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              Cheapest
            </button>

            <button
              onClick={() => setSortBy("closest")}
              className={`flex-1 rounded-xl py-2 font-medium ${
                sortBy === "closest"
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              Closest
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center text-zinc-300">
            🔎 Searching nearby gas stations...
          </div>
        )}

        {!loading && hasSearched && stations.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-zinc-300">
            <p className="font-semibold text-white mb-2">No gas stations found nearby.</p>
            <p className="text-sm text-zinc-400">
              Try increasing the radius, using current location, or searching another ZIP code.
            </p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {sortedStations.map((station, index) => (
              <div
                key={station.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">{station.name}</h2>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {station.rating && (
                        <span className="text-xs bg-zinc-800 text-zinc-200 px-2 py-1 rounded-full">
                          ⭐ {station.rating} ({station.reviews})
                        </span>
                      )}

                      {station.openNow !== undefined && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            station.openNow
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {station.openNow ? "Open now" : "Closed"}
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-400 text-sm mt-3">{station.address}</p>

                    <p className="text-zinc-500 text-sm mt-1">
                      📍 {station.distance.toFixed(1)} mi away
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-green-400">
                      ${station.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">Estimated</p>

                    {index === 0 && (
                      <span className="inline-block mt-2 text-xs bg-green-500 text-black px-2 py-1 rounded-full font-semibold">
                        {sortBy === "cheapest" ? "Cheapest" : "Closest"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-zinc-600 text-center mt-6">
          Gas station locations powered by Google Maps • Prices estimated for now
        </p>
      </div>
    </div>
  )
}