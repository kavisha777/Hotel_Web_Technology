
import { useEffect, useState } from 'react';
import api from '../services/api';


function Home({ user, onLogin, onRegister, onLogout }) {
 

  const [rooms, setRooms] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    api.get('/rooms')
        .then((response) => {
            setRooms(response.data.data);
        })
        .catch((err) => {
            console.error(err);
            setError('Unable to load rooms. Please try again.');
        })
        .finally(() => {
            setLoading(false);
        });
}, []);


  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
            <i className="bi bi-water me-2"></i>
            COASTAL HAVEN
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
              <li className="nav-item"><a className="nav-link" href="#home">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#rooms">Rooms</a></li>
              <li className="nav-item"><a className="nav-link" href="#facilities">Facilities</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
             <li className="nav-item">
    <a className="btn btn-dark px-4" href="#booking">
        Book Now
    </a>
</li>

{user ? (
    <>
        <li className="nav-item">
            <span className="nav-link">
                Welcome, {user.name}
            </span>
        </li>

        <li className="nav-item">
            <button
                className="btn btn-outline-dark"
                onClick={onLogout}
            >
                Logout
            </button>
        </li>
    </>
) : (
    <>
        <li className="nav-item">
            <button
                className="btn btn-outline-dark"
                onClick={onLogin}
            >
                Login
            </button>
        </li>

        <li className="nav-item">
            <button
                className="btn btn-dark"
                onClick={onRegister}
            >
                Register
            </button>
        </li>
    </>
)}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" id="home">
        <div className="container hero-content">
          <span className="hero-label">WELCOME TO COASTAL HAVEN</span>
          <h1>Discover Your Perfect<br />Coastal Escape.</h1>
          <p>
            Experience comfort, tranquillity and unforgettable moments
            at our beautiful coastal villa in Jaffna.
          </p>
          <a href="#rooms" className="btn btn-light btn-lg px-4">
            Explore Our Rooms <i className="bi bi-arrow-right ms-2"></i>
          </a>
        </div>
      </section>

      {/* Booking search */}
      <section className="container booking-section" id="booking">
        <div className="booking-panel shadow">
          <h4 className="mb-4">Find Your Stay</h4>

          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Check-in</label>
              <input type="date" className="form-control" />
            </div>

            <div className="col-md-3">
              <label className="form-label">Check-out</label>
              <input type="date" className="form-control" />
            </div>

            <div className="col-md-3">
              <label className="form-label">Guests</label>
              <select className="form-select">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4 Guests</option>
              </select>
            </div>

            <div className="col-md-3">
              <a href="#rooms" className="btn btn-dark w-100 py-2">
                Search Rooms
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="container intro-section text-center">
        <span className="section-label">YOUR COASTAL RETREAT</span>
        <h2>Where Comfort Meets Nature</h2>
        <p>
          Escape your everyday routine and enjoy a relaxing stay.
          Discover thoughtfully designed accommodation and welcoming hospitality.
        </p>
      </section>

      {/* Rooms */}
     
{/* Rooms */}
<section className="rooms-section" id="rooms">
    <div className="container">
        <div className="text-center mb-5">
            <span className="section-label">ACCOMMODATION</span>
            <h2>Explore Our Rooms</h2>
            <p>Find the perfect space for your stay.</p>
        </div>

        {loading && <p className="text-center">Loading rooms...</p>}

        {error && <p className="text-danger text-center">{error}</p>}

        {!loading && !error && rooms.length === 0 && (
            <p className="text-center">No rooms are currently available.</p>
        )}

        {!loading && !error && (
            <div className="row g-4">
                {rooms.map((room) => (
                    <div className="col-md-4" key={room.id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{room.name}</h5>

                                <p>{room.description}</p>

                                <p>
                                    <strong>Capacity:</strong> {room.capacity} guests
                                </p>

                                <h5>
                                    LKR {Number(room.price_per_night).toLocaleString('en-LK')}
                                    <small> / night</small>
                                </h5>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
</section>


      {/* Facilities */}
      <section className="container facilities-section" id="facilities">
        <div className="text-center mb-5">
          <span className="section-label">OUR FACILITIES</span>
          <h2>Everything You Need</h2>
        </div>

        <div className="row g-4 text-center">
          {[
            ['bi-wifi', 'Free Wi-Fi'],
            ['bi-cup-hot', 'Restaurant'],
            ['bi-water', 'Swimming Pool'],
            ['bi-car-front', 'Free Parking'],
          ].map(([icon, name]) => (
            <div className="col-6 col-md-3" key={name}>
              <div className="facility-card">
                <i className={`bi ${icon}`}></i>
                <h6>{name}</h6>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section" id="contact">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h4>COASTAL HAVEN</h4>
              <p>Your peaceful coastal escape in Jaffna, Sri Lanka.</p>
            </div>

            <div className="col-md-6 text-md-end">
              <h5>Contact Us</h5>
              <p><i className="bi bi-geo-alt me-2"></i>Jaffna, Sri Lanka</p>
              <p><i className="bi bi-envelope me-2"></i>info@coastalhaven.com</p>
            </div>
          </div>

          <hr />
          <p className="text-center mb-0">
            © 2026 Coastal Haven. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;