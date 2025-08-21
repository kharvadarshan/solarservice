import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SolarCalculator from '../../components/SolarCalculator';
import CountUp from '../../components/CountUp';

const SolarServiceHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [authUser, setAuthUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      setAuthUser(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.error('Error parsing auth user:', error);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuthUser(null);
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "California",
      text: "SolarTech transformed our home with clean energy. Our electricity bills dropped by 80%!",
      rating: 5,
      savings: "$2,400/year"
    },
    {
      name: "Mike Chen",
      location: "Texas",
      text: "Professional installation and amazing customer service. Highly recommend!",
      rating: 5,
      savings: "$3,200/year"
    },
    {
      name: "Emily Rodriguez",
      location: "Florida",
      text: "Best investment we've made for our home. The panels look great and work perfectly.",
      rating: 5,
      savings: "$2,800/year"
    }
  ];

  const services = [
    {
      title: "Residential Solar",
      description: "Custom solar solutions for your home with premium panels and expert installation.",
      icon: "🏠",
      features: ["25-year warranty", "Free consultation", "Financing options"]
    },
    {
      title: "Commercial Solar",
      description: "Scale your business with sustainable energy solutions and significant cost savings.",
      icon: "🏢",
      features: ["Enterprise solutions", "Tax incentives", "ROI analysis"]
    },
    {
      title: "Solar Maintenance",
      description: "Keep your solar system running at peak performance with our maintenance services.",
      icon: "🔧",
      features: ["Regular inspections", "Cleaning services", "Performance monitoring"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.2 }
    );

    const elements = document.querySelectorAll('section[id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToHash = (hash) => {
    const id = (hash || '').replace('#', '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      const OFFSET = 80;
      const y = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => scrollToHash(location.hash), 0);
    }
  }, [location.hash]);

  const handleNavClick = (hash) => (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash);
      }
      scrollToHash(hash);
    }
    setIsMenuOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your inquiry! We\'ll contact you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="absolute inset-0 min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50 transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">☀</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                SolarTech
              </span>
            </div>

            {/* Center nav */}
            <div className="hidden md:flex flex-1 justify-center space-x-8">
              <Link to="/#home" onClick={handleNavClick('#home')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Home</Link>
              <Link to="/#services" onClick={handleNavClick('#services')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Services</Link>
              <Link to="/#about" onClick={handleNavClick('#about')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">About</Link>
              <Link to="/#calculator" onClick={handleNavClick('#calculator')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Calculator</Link>
              <Link to="/book" className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Book</Link>
              <Link to="/#contact" onClick={handleNavClick('#contact')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Contact</Link>
            </div>

            {/* Auth actions */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {authUser ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">{authUser.name}</Link>
                  <button onClick={handleLogout} className="text-white bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-full font-medium transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Login</Link>
                  <Link to="/signup" className="text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full font-medium transition-colors">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-500 transition-colors ml-auto"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <Link to="/#home" onClick={handleNavClick('#home')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Home</Link>
              <Link to="/#services" onClick={handleNavClick('#services')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Services</Link>
              <Link to="/#about" onClick={handleNavClick('#about')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">About</Link>
              <Link to="/#calculator" onClick={handleNavClick('#calculator')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Calculator</Link>
              <Link to="/book" className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Book</Link>
              <Link to="/#contact" onClick={handleNavClick('#contact')} className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Contact</Link>
              <div className="border-t border-gray-200 pt-3 mt-1" />
              {authUser ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">{authUser.name}</Link>
                  <button onClick={handleLogout} className="text-white bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-full font-medium transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-orange-500 transition-colors duration-300 font-medium">Login</Link>
                  <Link to="/signup" className="text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full font-medium text-center transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Power Your Future with 
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent block">
                  Clean Energy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                Transform your home or business with premium solar solutions. Save money, reduce your carbon footprint, and invest in a sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
                  Book Installation
                </Link>
                <a href="#calculator" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-orange-500 hover:text-orange-500 transition-all duration-300 text-center">
                  Estimate Savings
                </a>
              </div>
              <div className="flex items-center gap-6 pt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span> Verified Installer</div>
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span> 25-Year Warranty</div>
                <div className="flex items-center gap-2"><span className="text-green-600">✓</span> Flexible Financing</div>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">
                    <CountUp from={0} to={500} separator="," duration={2} />+
                  </div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">
                    <CountUp from={0} to={25} duration={1.5} />+
                  </div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">
                    <CountUp from={0} to={98} duration={2} />%
                  </div>
                  <div className="text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Right visual image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-orange-100">
                <img
                  src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1600&auto=format&fit=crop"
                  alt="Solar panels installation"
                  className="w-full h-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <SolarCalculator />

      {/* Services Section */}
      <section id="services" className="py-20 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible['services'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Solar Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solar services tailored to meet your energy needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 transform transition-all duration-500 hover:scale-105 ${
                  isVisible['services']
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transform transition-all duration-1000 ${isVisible['about'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About SolarTech</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are a team of certified solar professionals dedicated to helping homes and businesses
                adopt clean energy. From design to installation and maintenance, we provide end-to-end service
                with industry-leading warranties and support.
              </p>
              <ul className="mt-6 space-y-3 text-gray-700">
                <li className="flex items-start"><span className="text-green-600 mr-2 mt-1">✓</span> NABCEP-certified installers</li>
                <li className="flex items-start"><span className="text-green-600 mr-2 mt-1">✓</span> 25-year product and performance warranties</li>
                <li className="flex items-start"><span className="text-green-600 mr-2 mt-1">✓</span> Local support and rapid service</li>
              </ul>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-orange-100">
              <img
                src="https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop"
                alt="About SolarTech"
                className="w-full h-full object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-500 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">
                <CountUp from={0} to={5} duration={2} />MW+
              </div>
              <div className="text-lg opacity-90">Solar Installed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">
                $<CountUp from={0} to={2} duration={2} />M+
              </div>
              <div className="text-lg opacity-90">Customer Savings</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">
                <CountUp from={0} to={1000} separator="," duration={2.5} />+
              </div>
              <div className="text-lg opacity-90">CO2 Tons Reduced</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">
                <CountUp from={0} to={24} duration={1} />/<CountUp from={0} to={7} duration={1} delay={0.5} />
              </div>
              <div className="text-lg opacity-90">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible['testimonials'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real customers who made the switch to solar
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 p-12 text-center">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-2xl">★</span>
                      ))}
                    </div>
                    <p className="text-xl text-gray-700 mb-6 italic leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.location}</div>
                    <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                      Saves {testimonial.savings}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-orange-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible['contact'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ready to Go Solar?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your free consultation today and discover how much you can save with solar energy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className={`space-y-8 transform transition-all duration-1000 ${isVisible['contact'] ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose SolarTech?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">25-year warranty on all installations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Certified and licensed installers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Flexible financing options available</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Free maintenance for first 2 years</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">📞</div>
                  <div>
                    <div className="font-semibold text-gray-900">Call Us</div>
                    <div className="text-gray-600">(555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">✉</div>
                  <div>
                    <div className="font-semibold text-gray-900">Email Us</div>
                    <div className="text-gray-600">info@solartech.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">📍</div>
                  <div>
                    <div className="font-semibold text-gray-900">Visit Us</div>
                    <div className="text-gray-600">123 Solar Street, Green City, GC 12345</div>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`bg-white shadow-xl rounded-2xl p-8 border border-gray-100 transform transition-all duration-1000 ${isVisible['contact'] ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Your Free Quote</h3>
              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your Phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your energy needs..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Get Free Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">☀</span>
                </div>
                <span className="text-xl font-bold">SolarTech</span>
              </div>
              <p className="text-gray-400">
                Leading the future of clean energy with innovative solar solutions for homes and businesses.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Residential Solar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Commercial Solar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Solar Maintenance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Energy Storage</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SolarTech. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SolarServiceHomepage;