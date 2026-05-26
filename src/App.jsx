import { useState } from "react"

const stations = [
  {
    id: 1,
    name: "Costco Gasoline",
    address: "5800 St Croix Ave, Golden Valley",
    distance: "2.1 mi",
    price: 2.89,
    updated: "5 mins ago",
  },
  {
    id: 2,
    name: "Shell",
    address: "101 Snelling Ave, St Paul",
    distance: "1.3 mi",
    price: 3.09,
    updated: "12 mins ago",
  },
  {
    id: 3,
    name: "Holiday",
    address: "Marshall Ave, St Paul",
    distance: "3.7 mi",
    price: 2.99,
    updated: "8 mins ago",
  },
  {
    id: 4,
    name: "BP",
    address: "University Ave, Minneapolis",
    distance: "5.2 mi",
    price: 3.19,
    updated: "20 mins ago",
  },
]

export default function App() {
  const [sortBy, setSortBy] = useState("cheapest")
  const [location, setLocation] = useState("")
  const [loadingLocation, setLoadingLocation] = useState(false)

  const sortedStations = [...stations].sort((a, b) => {
    if (sortBy === "cheapest") {
      return a.price - b.price
    }

    return parseFloat(a.distance) - parseFloat(b.distance)
  })

  const cheapestPrice = Math.min(...stations.map((s) => s.price))
  const mostExpensive = Math.max(...stations.map((s) => s.price))
  const savings = (mostExpensive - cheapestPrice).toFixed(2)

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported")
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      () => {
        setTimeout(() => {
          setLocation("Current Location")
          setLoadingLocation(false)
        }, 1200)
      },
      () => {
        alert("Unable to retrieve your location")
        setLoadingLocation(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-green-400">
            FuelSaver
          </h1>

          <p className="text-zinc-400 mt-2">
            Find affordable gas near you
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-4 mb-5 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-2">
            Search Location
          </p>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter ZIP code or city"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-3 text-white outline-none"
          />

          <select className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-3 text-white">
            <option>5 miles</option>
            <option>10 miles</option>
            <option>25 miles</option>
          </select>

          <button className="w-full bg-green-500 hover:bg-green-400 transition rounded-xl py-3 font-semibold text-black">
            Find Cheapest Gas
          </button>

          <button
            onClick={detectLocation}
            className="w-full mt-3 bg-zinc-800 hover:bg-zinc-700 transition rounded-xl py-3 font-medium text-zinc-200"
          >
            {loadingLocation
              ? "Detecting location..."
              : "Use My Current Location"}
          </button>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-5">
          <p className="text-green-300 font-medium">
            You could save up to ${savings}/gal nearby
          </p>
        </div>

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

        <div className="space-y-4">
          {sortedStations.map((station, index) => (
            <div
              key={station.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="font-semibold text-lg">
                    {station.name}
                  </h2>

                  <p className="text-zinc-400 text-sm">
                    {station.address}
                  </p>

                  <p className="text-zinc-500 text-sm mt-1">
                    {station.distance}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-green-400">
                    ${station.price.toFixed(2)}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {station.updated}
                  </p>

                  {index === 0 && sortBy === "cheapest" && (
                    <span className="inline-block mt-2 text-xs bg-green-500 text-black px-2 py-1 rounded-full font-semibold">
                      Cheapest
                    </span>
                  )}

                  {index === 0 && sortBy === "closest" && (
                    <span className="inline-block mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-semibold">
                      Closest
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-600 text-center mt-6">
          Demo MVP • Prices are sample estimates • Live pricing API coming soon
        </p>
      </div>
    </div>
  )
}