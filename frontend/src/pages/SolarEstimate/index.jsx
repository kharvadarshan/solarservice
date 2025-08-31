import React, { useState } from "react";
import "./index.css";

const SOLAR_PANELS = [
  { company: "Adani Solar", basePrice: 15000 },
  { company: "Vikram Solar", basePrice: 14000 },
  { company: "Tata Power Solar", basePrice: 15500 },
  { company: "Waaree Energies", basePrice: 13500 },
  { company: "Canadian Solar", basePrice: 12000 },
  { company: "Trina Solar", basePrice: 13000 },
  { company: "JA Solar", basePrice: 12500 },
  { company: "REC Solar", basePrice: 16000 },
];

const PANEL_WATTAGES = [300, 450, 550, 600];

const INVERTERS = [
  { company: "Luminous", basePrice: 25000 },
  { company: "Microtek", basePrice: 22000 },
  { company: "Sungrow", basePrice: 35000 },
  { company: "SMA", basePrice: 40000 },
  { company: "Huawei", basePrice: 37000 },
  { company: "Fronius", basePrice: 42000 },
  { company: "ABB", basePrice: 41000 },
  { company: "Delta Electronics", basePrice: 39000 },
];

const INVERTER_POWERS = [1, 3, 5, 10, 50];

const BATTERIES = [
  { company: "Exide", basePrice: 11000 },
  { company: "Amaron", basePrice: 11500 },
  { company: "Luminous", basePrice: 12000 },
  { company: "Okaya", basePrice: 13000 },
  { company: "Tesla Powerwall", basePrice: 90000 },
  { company: "LG Chem", basePrice: 85000 },
];

const BATTERY_CAPACITIES = ["150Ah", "200Ah", "250Ah", "Lithium-ion"];

const CABLES = ["Polycab", "Havells", "Finolex", "KEI Industries", "RR Kabel"];

const CABLE_TYPES = ["DC Solar Cable", "AC Cable", "Earthing Cable"];

const MOUNTING_TYPES = ["Roof-mount", "Ground-mount", "Elevated", "Carport"];

const MOUNTING_MATERIALS = ["GI", "Aluminum"];

const ACCESSORIES = [
  "Junction Box",
  "MC4 Connectors",
  "Earthing Kit",
  "Surge Protection Device",
];

const SolarEstimate = () => {
  const [panelCompany, setPanelCompany] = useState("");
  const [panelWattage, setPanelWattage] = useState("");
  const [panelQuantity, setPanelQuantity] = useState(0);

  const [inverterCompany, setInverterCompany] = useState("");
  const [inverterPower, setInverterPower] = useState("");

  const [batteryCompany, setBatteryCompany] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [batteryQuantity, setBatteryQuantity] = useState(0);

  const [cableCompany, setCableCompany] = useState("");
  const [cableType, setCableType] = useState("");
  const [cableLength, setCableLength] = useState(0);

  const [mountType, setMountType] = useState("");
  const [mountMaterial, setMountMaterial] = useState("");

  const [selectedAccessories, setSelectedAccessories] = useState([]);

  const getPriceByCompany = (company, list) => {
    const item = list.find((i) => i.company === company);
    return item ? item.basePrice : 0;
  };

  const panelCost = getPriceByCompany(panelCompany, SOLAR_PANELS) * panelQuantity;
  const inverterCost = getPriceByCompany(inverterCompany, INVERTERS);
  const batteryCost = getPriceByCompany(batteryCompany, BATTERIES) * batteryQuantity;
  const cableCost = cableLength * 100; // ₹100 per meter example
  const mountingCost = 20000; // fixed example price
  const accessoriesCost = selectedAccessories.length * 1500; // ₹1500 per accessory

  const totalCost =
    (panelCost || 0) +
    (inverterCost || 0) +
    (batteryCost || 0) +
    (cableCost || 0) +
    (mountingCost || 0) +
    (accessoriesCost || 0);

  return (
    <div className="estimate-container">
      <h1>⚡ Solar Installation Estimator</h1>
      <p className="subtitle">
        Select your preferred components and get an instant cost estimate.
      </p>

      <form className="estimate-form" onSubmit={(e) => e.preventDefault()}>
        <div className="card">
          <h2>☀️ Solar Panel</h2>
          <label>Company</label>
          <select value={panelCompany} onChange={(e) => setPanelCompany(e.target.value)}>
            <option value="">Select</option>
            {SOLAR_PANELS.map((p) => (
              <option key={p.company} value={p.company}>
                {p.company}
              </option>
            ))}
          </select>

          <label>Wattage (W)</label>
          <select value={panelWattage} onChange={(e) => setPanelWattage(e.target.value)}>
            <option value="">Select</option>
            {PANEL_WATTAGES.map((w) => (
              <option key={w} value={w}>
                {w}W
              </option>
            ))}
          </select>

          <label>Quantity</label>
          <input
            type="number"
            min="0"
            value={panelQuantity}
            onChange={(e) => setPanelQuantity(Number(e.target.value))}
          />
        </div>

        <div className="card">
          <h2>🔌 Inverter</h2>
          <label>Company</label>
          <select value={inverterCompany} onChange={(e) => setInverterCompany(e.target.value)}>
            <option value="">Select</option>
            {INVERTERS.map((i) => (
              <option key={i.company} value={i.company}>
                {i.company}
              </option>
            ))}
          </select>

          <label>Power Rating (kW)</label>
          <select value={inverterPower} onChange={(e) => setInverterPower(e.target.value)}>
            <option value="">Select</option>
            {INVERTER_POWERS.map((p) => (
              <option key={p} value={p}>
                {p} kW
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h2>🔋 Battery (Optional)</h2>
          <label>Company</label>
          <select value={batteryCompany} onChange={(e) => setBatteryCompany(e.target.value)}>
            <option value="">Select</option>
            {BATTERIES.map((b) => (
              <option key={b.company} value={b.company}>
                {b.company}
              </option>
            ))}
          </select>

          <label>Capacity</label>
          <select value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)}>
            <option value="">Select</option>
            {BATTERY_CAPACITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label>Quantity</label>
          <input
            type="number"
            min="0"
            value={batteryQuantity}
            onChange={(e) => setBatteryQuantity(Number(e.target.value))}
          />
        </div>

        <div className="card">
          <h2>🔧 Cables / Wires</h2>
          <label>Company</label>
          <select value={cableCompany} onChange={(e) => setCableCompany(e.target.value)}>
            <option value="">Select</option>
            {CABLES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label>Type</label>
          <select value={cableType} onChange={(e) => setCableType(e.target.value)}>
            <option value="">Select</option>
            {CABLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label>Length (meters)</label>
          <input
            type="number"
            min="0"
            value={cableLength}
            onChange={(e) => setCableLength(Number(e.target.value))}
          />
        </div>

        <div className="card">
          <h2>🏗️ Mounting Structure</h2>
          <label>Type</label>
          <select value={mountType} onChange={(e) => setMountType(e.target.value)}>
            <option value="">Select</option>
            {MOUNTING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label>Material</label>
          <select value={mountMaterial} onChange={(e) => setMountMaterial(e.target.value)}>
            <option value="">Select</option>
            {MOUNTING_MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h2>⚙️ Accessories</h2>
          {ACCESSORIES.map((acc) => (
            <label key={acc} className="accessory-checkbox">
              <input
                type="checkbox"
                checked={selectedAccessories.includes(acc)}
                onChange={() =>
                  setSelectedAccessories((prev) =>
                    prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
                  )
                }
              />
              {acc}
            </label>
          ))}
        </div>
      </form>

      <div className="total-cost">
        <h2>Total Estimated Cost</h2>
        <p>₹ {totalCost.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SolarEstimate;
