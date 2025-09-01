import { useMemo, useState } from 'react';

const SOLAR_INSOLATION_KWH_M2_DAY = 5; // average usable sun hours equivalent
const PANEL_WATTAGE_W = 400; // typical panel rating
const PANEL_EFFICIENCY = 0.18; // 18%
const SYSTEM_LOSSES = 0.85; // wiring, inverter, temperature

function formatNumber(value) {
	return new Intl.NumberFormat().format(Number.isFinite(value) ? Math.round(value) : 0);
}

export default function SolarCalculator() {
	const [inputs, setInputs] = useState({
		monthlyBill: '',
		utilityRate: '0.15',
		roofArea: '',
		roofTilt: '30',
		roofAzimuth: '180',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setInputs((prev) => ({ ...prev, [name]: value }));
	};

	const parsed = useMemo(() => {
		const monthlyBill = parseFloat(inputs.monthlyBill) || 0;
		const utilityRate = parseFloat(inputs.utilityRate) || 0.15;
		const roofArea = parseFloat(inputs.roofArea) || 0;
		const roofTilt = parseFloat(inputs.roofTilt) || 30;
		const roofAzimuth = parseFloat(inputs.roofAzimuth) || 180;
		return { monthlyBill, utilityRate, roofArea, roofTilt, roofAzimuth };
	}, [inputs]);

	// Estimate monthly kWh usage from bill and rate
	const monthlyUsageKWh = useMemo(() => {
		if (parsed.utilityRate <= 0) return 0;
		return parsed.monthlyBill / parsed.utilityRate;
	}, [parsed.monthlyBill, parsed.utilityRate]);

	// Very simplified orientation/tilt derate factor (1.0 is ideal south ~180°, 30° tilt)
	const orientationFactor = useMemo(() => {
		const azimuthDiff = Math.min(Math.abs(parsed.roofAzimuth - 180), 180);
		const azimuthFactor = 1 - (azimuthDiff / 180) * 0.2; // up to 20% loss at 0°/360°
		const tiltDiff = Math.min(Math.abs(parsed.roofTilt - 30), 60);
		const tiltFactor = 1 - (tiltDiff / 60) * 0.1; // up to 10% loss when far from 30°
		return Math.max(0.6, azimuthFactor * tiltFactor);
	}, [parsed.roofAzimuth, parsed.roofTilt]);

	// Production per m^2 per day
	const dailyKWhPerM2 = useMemo(() => {
		return SOLAR_INSOLATION_KWH_M2_DAY * PANEL_EFFICIENCY * SYSTEM_LOSSES * orientationFactor;
	}, [orientationFactor]);

	// System sizing based on area and panel wattage footprint (approx 2 m^2 per 400W panel)
	const panelAreaM2 = 2; // approximate area for a 400W panel
	const maxPanelsByArea = useMemo(() => {
		return Math.floor(parsed.roofArea > 0 ? parsed.roofArea / panelAreaM2 : 0);
	}, [parsed.roofArea]);

	// const systemKWdcByArea = useMemo(() => {
	// 	return (maxPanelsByArea * PANEL_WATTAGE_W) / 1000;
	// }, [maxPanelsByArea]);

	// Estimated monthly production from area-limited system
	const monthlyProductionKWh = useMemo(() => {
		const dailyKWh = dailyKWhPerM2 * parsed.roofArea;
		return dailyKWh * 30;
	}, [dailyKWhPerM2, parsed.roofArea]);

	// Required system size to offset usage
	const requiredSystemKW = useMemo(() => {
		if (monthlyUsageKWh <= 0) return 0;
		const dailyUsage = monthlyUsageKWh / 30;
		// kWh/day = kWdc * sunHours * losses -> kWdc = kWh/day / (sunHours * losses)
		const kwdc = dailyUsage / (SOLAR_INSOLATION_KWH_M2_DAY * SYSTEM_LOSSES * orientationFactor);
		return kwdc;
	}, [monthlyUsageKWh, orientationFactor]);

	const panelsNeeded = useMemo(() => {
		return Math.ceil((requiredSystemKW * 1000) / PANEL_WATTAGE_W) || 0;
	}, [requiredSystemKW]);

	const cappedOffset = useMemo(() => {
		if (monthlyProductionKWh <= 0 || monthlyUsageKWh <= 0) return 0;
		return Math.min(100, (monthlyProductionKWh / monthlyUsageKWh) * 100);
	}, [monthlyProductionKWh, monthlyUsageKWh]);

	const estimatedSavingsPerMonth = useMemo(() => {
		return Math.max(0, monthlyProductionKWh) * parsed.utilityRate;
	}, [monthlyProductionKWh, parsed.utilityRate]);

	return (
		<section id="calculator" className="py-20 bg-gray-50 w-full">
			<div className="w-full px-4 sm:px-6 lg:px-8">
			   
				<div className="text-center mb-10">
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900">Solar Estimation Calculator</h2>
					<p className="text-xl text-gray-600 mt-2">Quickly estimate system size, production, and savings.</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-white rounded-2xl shadow p-6 space-y-5">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Monthly Electricity Bill ($)</label>
							<input name="monthlyBill" value={inputs.monthlyBill} onChange={handleChange} type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g. 120" />
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Utility Rate ($/kWh)</label>
								<input name="utilityRate" value={inputs.utilityRate} onChange={handleChange} type="number" min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="0.15" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Roof Area (m²)</label>
								<input name="roofArea" value={inputs.roofArea} onChange={handleChange} type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g. 60" />
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Roof Tilt (°)</label>
								<input name="roofTilt" value={inputs.roofTilt} onChange={handleChange} type="number" min="0" max="60" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="30" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Roof Azimuth (° from North)</label>
								<input name="roofAzimuth" value={inputs.roofAzimuth} onChange={handleChange} type="number" min="0" max="360" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="180 = South" />
							</div>
						</div>
						<p className="text-sm text-gray-500">Assumptions: 5 sun-hours/day, 18% efficiency, typical losses and simplified orientation factor.</p>
					</div>

					<div className="bg-white rounded-2xl shadow p-6">
						<h3 className="text-xl font-semibold mb-4 text-gray-900">Estimate</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div className="p-4 rounded-lg bg-orange-50">
								<div className="text-sm text-gray-600">Monthly Usage</div>
								<div className="text-2xl font-bold text-orange-600">{formatNumber(monthlyUsageKWh)} kWh</div>
							</div>
							<div className="p-4 rounded-lg bg-green-50">
								<div className="text-sm text-gray-600">Area-limited Production</div>
								<div className="text-2xl font-bold text-green-700">{formatNumber(monthlyProductionKWh)} kWh/mo</div>
							</div>
							<div className="p-4 rounded-lg bg-blue-50">
								<div className="text-sm text-gray-600">Offset Potential</div>
								<div className="text-2xl font-bold text-blue-700">{Math.round(cappedOffset)}%</div>
							</div>
							<div className="p-4 rounded-lg bg-purple-50">
								<div className="text-sm text-gray-600">System Size Needed</div>
								<div className="text-2xl font-bold text-purple-700">{requiredSystemKW.toFixed(1)} kW</div>
							</div>
							<div className="p-4 rounded-lg bg-yellow-50">
								<div className="text-sm text-gray-600">Panels Needed</div>
								<div className="text-2xl font-bold text-yellow-700">{formatNumber(panelsNeeded)}</div>
							</div>
							<div className="p-4 rounded-lg bg-teal-50">
								<div className="text-sm text-gray-600">Savings / Month</div>
								<div className="text-2xl font-bold text-teal-700">${formatNumber(estimatedSavingsPerMonth)}</div>
							</div>
						</div>
						<div className="mt-6 text-sm text-gray-500">This is a simplified estimate. Actual performance varies by location, weather, shading, equipment, and installation specifics.</div>
					</div>
				</div>
			</div>
		</section>
	);
} 