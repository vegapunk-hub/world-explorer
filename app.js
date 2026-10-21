const { useState, useEffect } = React;
const h = htm.bind(React.createElement);

// Data link: local file, or your own raw GitHub link to a JSON file
const API = "countries.json";

const COLORS = { // banner colour per region
  Africa: "from-amber-200 to-orange-300", Americas: "from-rose-200 to-pink-300",
  Asia: "from-emerald-200 to-teal-300", Europe: "from-sky-200 to-indigo-300",
  Oceania: "from-violet-200 to-fuchsia-300",
};
const REGIONS = Object.keys(COLORS);
const short = (n) => new Intl.NumberFormat("en", { notation: "compact" }).format(n);
const Flag = ({ c, size }) => h`<img src=${c.flags.png} alt=${c.name.common} className=${size + " rounded-full object-cover ring-4 ring-white shadow-lg"} />`;

function App() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const [top5, setTop5] = useState(false);
  const [sel, setSel] = useState(null);

  useEffect(() => { fetch(API).then((r) => r.json()).then(setData).catch(() => setErr(true)); }, []);

  // typing a region ("asia", "africa"...) shows that whole region
  const t = q.trim().toLowerCase();
  const typed = t.length >= 4 && REGIONS.find((r) => r.toLowerCase().startsWith(t));
  let list = data
    .filter((c) => region === "All" || c.region === region)
    .filter((c) => (typed ? c.region === typed : c.name.common.toLowerCase().includes(t)))
    .sort((a, b) => b.population - a.population);
  if (top5) list = list.slice(0, 5);

  const btn = (on) => "btn btn-sm rounded-full " + (on ? "btn-neutral" : "bg-white border-0");

  return h`
    <div className="max-w-6xl mx-auto px-4 pb-16">
      <h1 className="pt-10 text-4xl font-extrabold">World Explorer 🌍</h1>
      <p className="text-gray-500 mb-4">Discover the countries of the world</p>

      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-base-200/80 backdrop-blur space-y-3">
        <input value=${q} onChange=${(e) => setQ(e.target.value)} placeholder="🔍  Search a country, or try “asia” or “africa”"
               className="input w-full rounded-full shadow-sm" />
        <div className="flex gap-2 overflow-x-auto">
          ${["All", ...REGIONS].map((r) => h`<button key=${r} className=${btn(region === r)} onClick=${() => setRegion(r)}>${r}</button>`)}
          <button className=${btn(top5) + " ml-auto"} onClick=${() => setTop5(!top5)}>👑 Top 5</button>
        </div>
      </div>

      ${err && h`<p className="text-center mt-16">😕 Couldn't load data. Run it from a local server.</p>`}
      ${!err && !data.length && h`<p className="text-center mt-16"><span className="loading loading-spinner"></span> Loading countries...</p>`}
      ${data.length > 0 && h`<p className="my-3 text-gray-500">${list.length} countries · sorted by population</p>`}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        ${list.map((c) => h`
          <div key=${c.cca3} onClick=${() => setSel(c)}
               className="animate__animated animate__fadeInUp card bg-base-100 shadow cursor-pointer overflow-hidden hover:shadow-xl hover:-translate-y-1 transition">
            <div className=${"h-20 bg-gradient-to-br " + COLORS[c.region]}></div>
            <div className="-mt-12 pb-5 px-3 flex flex-col items-center text-center">
              <${Flag} c=${c} size="w-24 h-24" />
              <h3 className="mt-2 font-semibold text-lg">${c.name.common}</h3>
              <p className="text-sm text-gray-500">🏛️ ${c.capital[0]}</p>
              <div className="mt-2 flex gap-1">
                <span className="badge badge-ghost">👥 ${short(c.population)}</span>
                <span className="badge badge-ghost">${c.region}</span>
              </div>
            </div>
          </div>`)}
      </div>

      ${sel && h`
        <div className="modal modal-open modal-bottom sm:modal-middle" onClick=${() => setSel(null)}>
          <div className="modal-box p-0 animate__animated animate__fadeInUp animate__faster" onClick=${(e) => e.stopPropagation()}>
            <div className=${"h-28 bg-gradient-to-br " + COLORS[sel.region]}></div>
            <div className="-mt-16 px-6 pb-6 text-center">
              <div className="flex justify-center"><${Flag} c=${sel} size="w-32 h-32" /></div>
              <h2 className="mt-3 text-2xl font-extrabold">${sel.name.common}</h2>
              <p className="text-sm text-gray-500 mb-4">${sel.name.official}</p>
              <div className="grid grid-cols-2 gap-2 text-left text-sm">
                ${[["🏛️ Capital", sel.capital.join(", ")], ["👥 Population", sel.population.toLocaleString()],
                   ["🌏 Region", sel.subregion], ["📐 Area", sel.area.toLocaleString() + " km²"],
                   ["💰 Currency", Object.values(sel.currencies).map((x) => x.name + " " + x.symbol).join(", ")],
                   ["🗣️ Languages", Object.values(sel.languages).join(", ")]].map(([k, v]) => h`
                  <div key=${k} className="bg-base-200 rounded-2xl p-3"><p className="text-xs text-gray-500">${k}</p><p className="font-semibold">${v}</p></div>`)}
              </div>
              <button className="btn btn-neutral rounded-full mt-5 px-10" onClick=${() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>`}
    </div>`;
}

ReactDOM.createRoot(document.getElementById("root")).render(h`<${App} />`);
