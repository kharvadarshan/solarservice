import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';


export default function SolarBookingForm() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [formData, setFormData] = useState({
    pincode: '',
    electricityBill: '',
    serviceProvider: '',
    billingCycle: 'one-month',
    calculatedPower: 0,
    selectedPanelType: null,
    selectedCompany: null,
    name: '',
    email: '',
    phone: '',
    address: '',
    electricityBillImage: null,
    siteVideo: null
  });
  const [submissionStatus, setSubmissionStatus] = useState(null); // New state for submission status

  const steps = [
    { label: 'Solar Requirements', icon: '⚡' },
    { label: 'Power Calculation', icon: '🧮' },
    { label: 'Panel Selection', icon: '☀️' },
    { label: 'Company Selection', icon: '🏢' },
    { label: 'Personal Info', icon: '👤' }
  ];

  const serviceProviders = [
    'TATA Power', 'Adani Electricity', 'Reliance Energy', 'BESCOM', 'KSEB', 'TNEB', 'Other'
  ];

  const panelTypes = [
    { id: 1, name: 'Monocrystalline', wattPeak: 540, plates: 6, requiredPower: 3.24, price: 180000 },
    { id: 2, name: 'Polycrystalline', wattPeak: 450, plates: 8, requiredPower: 3.6, price: 150000 },
    { id: 3, name: 'Thin Film', wattPeak: 400, plates: 9, requiredPower: 3.6, price: 120000 },
    { id: 4, name: 'Bifacial', wattPeak: 600, plates: 5, requiredPower: 3.0, price: 200000 }
  ];

  const solarCompanies = [
    { 
      id: 1, 
      name: 'Tata Solar', 
      tentativeAmount: 180000, 
      subsidyAmount: 54000, 
      effectiveAmount: 126000, 
      roi: '8.5%', 
      breakEven: '7.2 years',
      rating: 4.8 
    },
    { 
      id: 2, 
      name: 'Adani Solar', 
      tentativeAmount: 175000, 
      subsidyAmount: 52500, 
      effectiveAmount: 122500, 
      roi: '9.1%', 
      breakEven: '6.8 years',
      rating: 4.6 
    },
    { 
      id: 3, 
      name: 'Vikram Solar', 
      tentativeAmount: 165000, 
      subsidyAmount: 49500, 
      effectiveAmount: 115500, 
      roi: '9.8%', 
      breakEven: '6.3 years',
      rating: 4.7 
    },
    { 
      id: 4, 
      name: 'Waaree Solar', 
      tentativeAmount: 170000, 
      subsidyAmount: 51000, 
      effectiveAmount: 119000, 
      roi: '9.4%', 
      breakEven: '6.6 years',
      rating: 4.5 
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const calculateSolarPower = () => {
    const monthlyBill = parseInt(formData.electricityBill);
    const multiplier = formData.billingCycle === 'two-month' ? 0.5 : 1;
    const avgMonthlyBill = monthlyBill * multiplier;
    
    const estimatedUnits = avgMonthlyBill / 6;
    const calculatedPower = Math.ceil(estimatedUnits / 150 * 1000) / 1000;
    
    setFormData(prev => ({
      ...prev,
      calculatedPower: calculatedPower
    }));
    setActiveIndex(1);
  };

  const nextStep = () => {
    if (activeIndex < steps.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevStep = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('pincode', formData.pincode);
      formDataToSend.append('electricityBill', formData.electricityBill);
      formDataToSend.append('serviceProvider', formData.serviceProvider);
      formDataToSend.append('billingCycle', formData.billingCycle);
      formDataToSend.append('calculatedPower', formData.calculatedPower);
      formDataToSend.append('selectedPanelType', JSON.stringify(formData.selectedPanelType));
      formDataToSend.append('selectedCompany', JSON.stringify(formData.selectedCompany));
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      
      // Add files if they exist
      if (formData.electricityBillImage) {
        formDataToSend.append('electricityBillImage', formData.electricityBillImage);
      }
      if (formData.siteVideo) {
        formDataToSend.append('siteVideo', formData.siteVideo);
      }

      const response = await api.post('/api/bookings', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);

      if (response.data.success) {
        setSubmissionStatus('success');
        setFormData({
          pincode: '',
          electricityBill: '',
          serviceProvider: '',
          billingCycle: 'one-month',
          calculatedPower: 0,
          selectedPanelType: null,
          selectedCompany: null,
          name: '',
          email: '',
          phone: '',
          address: '',
          electricityBillImage: null,
          siteVideo: null
        });
        setActiveIndex(0);
      } else {
        setSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
    }
  };

  const renderStepContent = () => {
    if (submissionStatus === 'success') {
      return (
        <div className="space-y-6 text-center">
          <div className="bg-green-100 border border-green-300 rounded-xl p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Booking Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your solar installation booking. We will contact you shortly with further details.
            </p>
            <button
              onClick={() => {
                setSubmissionStatus(null);
                setActiveIndex(0);
              }}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600"
            >
              Start New Booking
            </button>
          </div>
        </div>
      );
    }

    if (submissionStatus === 'error') {
      return (
        <div className="space-y-6 text-center">
          <div className="bg-red-100 border border-red-300 rounded-xl p-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">Submission Failed</h2>
            <p className="text-gray-600 mb-6">
              There was an error submitting your booking. Please try again later.
            </p>
            <button
              onClick={() => {
                setSubmissionStatus(null);
                setActiveIndex(4);
              }}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch(activeIndex) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Solar Requirements</h2>
              <p className="text-gray-600">Let's start by understanding your electricity consumption</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📍</span>
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your pincode"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">⚡</span>
                  Electricity Bill Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.electricityBill}
                  onChange={(e) => handleInputChange('electricityBill', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your bill amount"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">🏢</span>
                  Service Provider
                </label>
                <select
                  value={formData.serviceProvider}
                  onChange={(e) => handleInputChange('serviceProvider', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select service provider</option>
                  {serviceProviders.map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📅</span>
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="one-month">One Month</option>
                  <option value="two-month">Two Month</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={calculateSolarPower}
                disabled={!formData.pincode || !formData.electricityBill || !formData.serviceProvider}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>🧮</span>
                Calculate Solar Power
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🧮</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Power Calculation Results</h2>
              <p className="text-gray-600">Based on your electricity consumption, here's your solar power requirement</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-8 text-center">
              <div className="text-6xl font-bold text-orange-600 mb-4">
                {formData.calculatedPower} kW
              </div>
              <p className="text-xl text-gray-700 mb-4">Recommended Solar System Size</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600">Monthly Bill</div>
                  <div className="text-xl font-semibold text-gray-900">₹{formData.electricityBill}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600">Billing Cycle</div>
                  <div className="text-xl font-semibold text-gray-900">{formData.billingCycle === 'one-month' ? '1 Month' : '2 Months'}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600">Service Provider</div>
                  <div className="text-xl font-semibold text-gray-900">{formData.serviceProvider}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 flex items-center gap-2"
              >
                Next Step
                <span>→</span>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">☀️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Solar Panel Type</h2>
              <p className="text-gray-600">Choose the solar panel technology that best fits your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {panelTypes.map(panel => (
                <div
                  key={panel.id}
                  onClick={() => handleInputChange('selectedPanelType', panel)}
                  className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    formData.selectedPanelType?.id === panel.id
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{panel.name}</h3>
                    <span className="text-2xl">☀️</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Watt Peak:</span>
                      <span className="font-medium">{panel.wattPeak} Wp</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Plates:</span>
                      <span className="font-medium">{panel.plates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Required Power:</span>
                      <span className="font-medium">{panel.requiredPower} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estimated Cost:</span>
                      <span className="font-semibold text-orange-600">₹{panel.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={nextStep}
                disabled={!formData.selectedPanelType}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next Step
                <span>→</span>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Solar Company</h2>
              <p className="text-gray-600">Select from top-rated solar installation companies</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Requirements Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Electricity Bill:</span>
                  <p className="font-medium">₹{formData.electricityBill}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Billing Cycle:</span>
                  <p className="font-medium">{formData.billingCycle === 'one-month' ? '1 Month' : '2 Months'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Pincode:</span>
                  <p className="font-medium">{formData.pincode}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Panel Type:</span>
                  <p className="font-medium">{formData.selectedPanelType?.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {solarCompanies.map(company => (
                <div
                  key={company.id}
                  onClick={() => handleInputChange('selectedCompany', company)}
                  className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    formData.selectedCompany?.id === company.id
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(company.rating))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{company.rating}/5</span>
                      </div>
                    </div>
                    <span className="text-3xl">🏢</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Tentative Amount</span>
                      <p className="font-semibold text-gray-900">₹{company.tentativeAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Subsidy Amount</span>
                      <p className="font-semibold text-green-600">₹{company.subsidyAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Effective Amount</span>
                      <p className="font-semibold text-orange-600">₹{company.effectiveAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">ROI</span>
                      <p className="font-semibold text-blue-600">{company.roi}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Break Even</span>
                      <p className="font-semibold text-purple-600">{company.breakEven}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={nextStep}
                disabled={!formData.selectedCompany}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next Step
                <span>→</span>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Almost done! Please provide your contact details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">👤</span>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📧</span>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📱</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">🏠</span>
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your complete address"
                  required
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📎 Upload Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">📄</span>
                    Electricity Bill Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('electricityBillImage', e.target.files[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {formData.electricityBillImage && (
                      <p className="text-sm text-green-600 mt-1">✓ {formData.electricityBillImage.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">🎥</span>
                    Site Video
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange('siteVideo', e.target.files[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {formData.siteVideo && (
                      <p className="text-sm text-green-600 mt-1">✓ {formData.siteVideo.name}</p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload your electricity bill image and a video of your installation site to help us provide better estimates.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Selected Company:</span>
                  <p className="font-medium">{formData.selectedCompany?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Panel Type:</span>
                  <p className="font-medium">{formData.selectedPanelType?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">System Size:</span>
                  <p className="font-medium">{formData.calculatedPower} kW</p>
                </div>
                <div>
                  <span className="text-gray-600">Effective Amount:</span>
                  <p className="font-medium text-orange-600">₹{formData.selectedCompany?.effectiveAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
                className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Submit Booking Request
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50 py-8 px-4">
                          <Link to="/dashboard" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors">Back to Home</Link>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
        
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                    index <= activeIndex
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                </div>
                <span className={`text-xs text-center ${index <= activeIndex ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStepContent()}
        </div>

        {activeIndex > 0 && activeIndex < 4 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-600 flex items-center gap-2"
            >
              <span>←</span>
              Previous
            </button>
            {activeIndex !== 1 && (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 flex items-center gap-2"
              >
                Next
                <span>→</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState } from 'react';

// export default function SolarBookingForm() {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [formData, setFormData] = useState({
//     // Step 1: Solar Requirements
//     pincode: '',
//     electricityBill: '',
//     serviceProvider: '',
//     billingCycle: 'one-month',
    
//     // Step 2: Solar Power Calculation (calculated based on step 1)
//     calculatedPower: 0,
    
//     // Step 3: Solar Panel Selection
//     selectedPanelType: null,
    
//     // Step 4: Company Selection
//     selectedCompany: null,
    
//     // Step 5: Personal Information
//     name: '',
//     email: '',
//     phone: '',
//     address: ''
//   });

//   const steps = [
//     { label: 'Solar Requirements', icon: '⚡' },
//     { label: 'Power Calculation', icon: '🧮' },
//     { label: 'Panel Selection', icon: '☀️' },
//     { label: 'Company Selection', icon: '🏢' },
//     { label: 'Personal Info', icon: '👤' }
//   ];

//   const serviceProviders = [
//     'TATA Power', 'Adani Electricity', 'Reliance Energy', 'BESCOM', 'KSEB', 'TNEB', 'Other'
//   ];

//   const panelTypes = [
//     { id: 1, name: 'Monocrystalline', wattPeak: 540, plates: 6, requiredPower: 3.24, price: 180000 },
//     { id: 2, name: 'Polycrystalline', wattPeak: 450, plates: 8, requiredPower: 3.6, price: 150000 },
//     { id: 3, name: 'Thin Film', wattPeak: 400, plates: 9, requiredPower: 3.6, price: 120000 },
//     { id: 4, name: 'Bifacial', wattPeak: 600, plates: 5, requiredPower: 3.0, price: 200000 }
//   ];

//   const solarCompanies = [
//     { 
//       id: 1, 
//       name: 'Tata Solar', 
//       tentativeAmount: 180000, 
//       subsidyAmount: 54000, 
//       effectiveAmount: 126000, 
//       roi: '8.5%', 
//       breakEven: '7.2 years',
//       rating: 4.8 
//     },
//     { 
//       id: 2, 
//       name: 'Adani Solar', 
//       tentativeAmount: 175000, 
//       subsidyAmount: 52500, 
//       effectiveAmount: 122500, 
//       roi: '9.1%', 
//       breakEven: '6.8 years',
//       rating: 4.6 
//     },
//     { 
//       id: 3, 
//       name: 'Vikram Solar', 
//       tentativeAmount: 165000, 
//       subsidyAmount: 49500, 
//       effectiveAmount: 115500, 
//       roi: '9.8%', 
//       breakEven: '6.3 years',
//       rating: 4.7 
//     },
//     { 
//       id: 4, 
//       name: 'Waaree Solar', 
//       tentativeAmount: 170000, 
//       subsidyAmount: 51000, 
//       effectiveAmount: 119000, 
//       roi: '9.4%', 
//       breakEven: '6.6 years',
//       rating: 4.5 
//     }
//   ];

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const calculateSolarPower = () => {
//     const monthlyBill = parseInt(formData.electricityBill);
//     const multiplier = formData.billingCycle === 'two-month' ? 0.5 : 1;
//     const avgMonthlyBill = monthlyBill * multiplier;
    
//     // Simple calculation: assuming ₹6 per unit and 150 units per kW requirement
//     const estimatedUnits = avgMonthlyBill / 6;
//     const calculatedPower = Math.ceil(estimatedUnits / 150 * 1000) / 1000; // Round to 3 decimal places
    
//     setFormData(prev => ({
//       ...prev,
//       calculatedPower: calculatedPower
//     }));
//     setActiveIndex(1);
//   };

//   const nextStep = () => {
//     if (activeIndex < steps.length - 1) {
//       setActiveIndex(activeIndex + 1);
//     }
//   };

//   const prevStep = () => {
//     if (activeIndex > 0) {
//       setActiveIndex(activeIndex - 1);
//     }
//   };

//   const handleSubmit = () => {
//     alert('Solar installation booking submitted successfully! We will contact you shortly.');
//   };

//   const renderStepContent = () => {
//     switch(activeIndex) {
//       case 0:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-6xl mb-4">⚡</div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Solar Requirements</h2>
//               <p className="text-gray-600">Let's start by understanding your electricity consumption</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">📍</span>
//                   Pincode
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.pincode}
//                   onChange={(e) => handleInputChange('pincode', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter your pincode"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">⚡</span>
//                   Electricity Bill Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.electricityBill}
//                   onChange={(e) => handleInputChange('electricityBill', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter your bill amount"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">🏢</span>
//                   Service Provider
//                 </label>
//                 <select
//                   value={formData.serviceProvider}
//                   onChange={(e) => handleInputChange('serviceProvider', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   required
//                 >
//                   <option value="">Select service provider</option>
//                   {serviceProviders.map(provider => (
//                     <option key={provider} value={provider}>{provider}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">📅</span>
//                   Billing Cycle
//                 </label>
//                 <select
//                   value={formData.billingCycle}
//                   onChange={(e) => handleInputChange('billingCycle', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 >
//                   <option value="one-month">One Month</option>
//                   <option value="two-month">Two Month</option>
//                 </select>
//               </div>
//             </div>

//             <div className="flex justify-center mt-8">
//               <button
//                 onClick={calculateSolarPower}
//                 disabled={!formData.pincode || !formData.electricityBill || !formData.serviceProvider}
//                 className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 <span>🧮</span>
//                 Calculate Solar Power
//               </button>
//             </div>
//           </div>
//         );

//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-6xl mb-4">🧮</div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Power Calculation Results</h2>
//               <p className="text-gray-600">Based on your electricity consumption, here's your solar power requirement</p>
//             </div>

//             <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-8 text-center">
//               <div className="text-6xl font-bold text-orange-600 mb-4">
//                 {formData.calculatedPower} kW
//               </div>
//               <p className="text-xl text-gray-700 mb-4">Recommended Solar System Size</p>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//                 <div className="bg-white rounded-lg p-4 shadow-sm">
//                   <div className="text-sm text-gray-600">Monthly Bill</div>
//                   <div className="text-xl font-semibold text-gray-900">₹{formData.electricityBill}</div>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow-sm">
//                   <div className="text-sm text-gray-600">Billing Cycle</div>
//                   <div className="text-xl font-semibold text-gray-900">{formData.billingCycle === 'one-month' ? '1 Month' : '2 Months'}</div>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 shadow-sm">
//                   <div className="text-sm text-gray-600">Service Provider</div>
//                   <div className="text-xl font-semibold text-gray-900">{formData.serviceProvider}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-center">
//               <button
//                 onClick={nextStep}
//                 className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 flex items-center gap-2"
//               >
//                 Next Step
//                 <span>→</span>
//               </button>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-6xl mb-4">☀️</div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Solar Panel Type</h2>
//               <p className="text-gray-600">Choose the solar panel technology that best fits your needs</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {panelTypes.map(panel => (
//                 <div
//                   key={panel.id}
//                   onClick={() => handleInputChange('selectedPanelType', panel)}
//                   className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
//                     formData.selectedPanelType?.id === panel.id
//                       ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
//                       : 'border-gray-200 hover:border-orange-300'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-gray-900">{panel.name}</h3>
//                     <span className="text-2xl">☀️</span>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Watt Peak:</span>
//                       <span className="font-medium">{panel.wattPeak} Wp</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Plates:</span>
//                       <span className="font-medium">{panel.plates}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Required Power:</span>
//                       <span className="font-medium">{panel.requiredPower} kW</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Estimated Cost:</span>
//                       <span className="font-semibold text-orange-600">₹{panel.price.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-center">
//               <button
//                 onClick={nextStep}
//                 disabled={!formData.selectedPanelType}
//                 className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 Next Step
//                 <span>→</span>
//               </button>
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-6xl mb-4">🏢</div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Solar Company</h2>
//               <p className="text-gray-600">Select from top-rated solar installation companies</p>
//             </div>

//             <div className="bg-gray-50 rounded-xl p-6 mb-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Requirements Summary</h3>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div>
//                   <span className="text-sm text-gray-600">Electricity Bill:</span>
//                   <p className="font-medium">₹{formData.electricityBill}</p>
//                 </div>
//                 <div>
//                   <span className="text-sm text-gray-600">Billing Cycle:</span>
//                   <p className="font-medium">{formData.billingCycle === 'one-month' ? '1 Month' : '2 Months'}</p>
//                 </div>
//                 <div>
//                   <span className="text-sm text-gray-600">Pincode:</span>
//                   <p className="font-medium">{formData.pincode}</p>
//                 </div>
//                 <div>
//                   <span className="text-sm text-gray-600">Panel Type:</span>
//                   <p className="font-medium">{formData.selectedPanelType?.name}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {solarCompanies.map(company => (
//                 <div
//                   key={company.id}
//                   onClick={() => handleInputChange('selectedCompany', company)}
//                   className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
//                     formData.selectedCompany?.id === company.id
//                       ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
//                       : 'border-gray-200 hover:border-orange-300'
//                   }`}
//                 >
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
//                       <div className="flex items-center mt-1">
//                         <div className="flex text-yellow-400">
//                           {'★'.repeat(Math.floor(company.rating))}
//                         </div>
//                         <span className="ml-2 text-sm text-gray-600">{company.rating}/5</span>
//                       </div>
//                     </div>
//                     <span className="text-3xl">🏢</span>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                     <div>
//                       <span className="text-sm text-gray-600">Tentative Amount</span>
//                       <p className="font-semibold text-gray-900">₹{company.tentativeAmount.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">Subsidy Amount</span>
//                       <p className="font-semibold text-green-600">₹{company.subsidyAmount.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">Effective Amount</span>
//                       <p className="font-semibold text-orange-600">₹{company.effectiveAmount.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">ROI</span>
//                       <p className="font-semibold text-blue-600">{company.roi}</p>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">Break Even</span>
//                       <p className="font-semibold text-purple-600">{company.breakEven}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-center">
//               <button
//                 onClick={nextStep}
//                 disabled={!formData.selectedCompany}
//                 className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 Next Step
//                 <span>→</span>
//               </button>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-6xl mb-4">👤</div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
//               <p className="text-gray-600">Almost done! Please provide your contact details</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">👤</span>
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">📧</span>
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter your email address"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">📱</span>
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => handleInputChange('phone', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter your phone number"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                   <span className="mr-2">🏠</span>
//                   Address
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.address}
//                   onChange={(e) => handleInputChange('address', e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter your complete address"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-gray-600">Selected Company:</span>
//                   <p className="font-medium">{formData.selectedCompany?.name}</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-600">Panel Type:</span>
//                   <p className="font-medium">{formData.selectedPanelType?.name}</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-600">System Size:</span>
//                   <p className="font-medium">{formData.calculatedPower} kW</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-600">Effective Amount:</span>
//                   <p className="font-medium text-orange-600">₹{formData.selectedCompany?.effectiveAmount.toLocaleString()}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-center">
//               <button
//                 onClick={handleSubmit}
//                 disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
//                 className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
//               >
//                 Submit Booking Request
//               </button>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Progress Steps */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             {steps.map((step, index) => {
//               return (
//                 <div key={index} className="flex flex-col items-center">
//                   <div
//                     className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
//                       index <= activeIndex
//                         ? 'bg-orange-500 border-orange-500 text-white'
//                         : 'bg-gray-100 border-gray-300 text-gray-400'
//                     }`}
//                   >
//                     <span className="text-lg">{step.icon}</span>
//                   </div>
//                   <span className={`text-xs text-center ${index <= activeIndex ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
//                     {step.label}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
          
//           {/* Progress Bar */}
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
//               style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {renderStepContent()}
//         </div>

//         {/* Navigation Buttons */}
//         {activeIndex > 0 && activeIndex < 4 && (
//           <div className="flex justify-between mt-6">
//             <button
//               onClick={prevStep}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-600 flex items-center gap-2"
//             >
//               <span>←</span>
//               Previous
//             </button>
//             {activeIndex !== 1 && (
//               <button
//                 onClick={nextStep}
//                 className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 flex items-center gap-2"
//               >
//                 Next
//                 <span>→</span>
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// import React, { useState } from 'react'; 
// import { Steps } from 'primereact/steps';
// import { Button } from 'primereact/button';

// export default function ControlledDemo() {
//     const [activeIndex, setActiveIndex] = useState(0);
//     const items = [
//         {
//             label: 'Personal Info'
//         },
//         {
//             label: 'Reservation'
//         },
//         {
//             label: 'Review'
//         }
//     ];

//     return (
//         <div className="card">
//             <div className="flex flex-wrap justify-content-end gap-2 mb-3">
//                 <Button outlined={activeIndex !== 0} rounded label="1" onClick={() => setActiveIndex(0)} className="w-2rem h-2rem p-0" />
//                 <Button outlined={activeIndex !== 1} rounded label="2" onClick={() => setActiveIndex(1)} className="w-2rem h-2rem p-0" />
//                 <Button outlined={activeIndex !== 2} rounded label="3" onClick={() => setActiveIndex(2)} className="w-2rem h-2rem p-0" />
//             </div>
//             <Steps model={items} activeIndex={activeIndex} />
//         </div>
//     )
// }
        

// import { useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'



        
// import api from '../api'
// export default function BookService() {
//   const navigate = useNavigate()
//   const [submitting, setSubmitting] = useState(false)
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     roofType: 'Other',
//     preferredDate: '',
//     message: ''
//   })

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((p) => ({ ...p, [name]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setSubmitting(true)
//     try {
      
//       const res = await api.post('/api/bookings', {
//         body: JSON.stringify(form)
//       })
//       if (!res.ok) throw new Error('Failed to submit booking')
//       await res.json()
//       alert('Booking submitted! We will contact you shortly.')
//       navigate('/dashboard')
//     } catch (error) {
//       console.error('Booking submission error:', error);
//       alert('Something went wrong. Please try again.')
//     } finally {
//       setSubmitting(false)
//     }
//   }

  

//   return (
//     <div className="min-h-screen bg-gray-50 pt-16">
//       <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
//         <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
//           <div className="mb-6 flex items-center justify-between">
//             <Link to="/dashboard" className="text-gray-600 hover:text-orange-600">← Back to Home</Link>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Book Solar Installation</h1>
//           </div>
          

//           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//               <input name="phone" value={form.phone} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//               <input name="address" value={form.address} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Roof Type</label>
//               <select name="roofType" value={form.roofType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
//                 <option>Tile</option>
//                 <option>Metal</option>
//                 <option>Shingle</option>
//                 <option>Flat</option>
//                 <option>Other</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
//               <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
//               <textarea name="message" rows="4" value={form.message} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Tell us about your installation needs..." />
//             </div>
//             <div className="md:col-span-2 flex items-center justify-end gap-4">
//               <Link to="/" className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600">Cancel</Link>
//               <button disabled={submitting} type="submit" className="px-6 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-60">
//                 {submitting ? 'Submitting...' : 'Submit Booking'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// } 