
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home({ user, onLogin, onRegister, onLogout }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/rooms');
                setRooms(response.data.data);
            } catch (err) {
                setError('Unable to load rooms. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/">
                        Coastal Haven
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="mainNavbar">
                        <div className="navbar-nav ms-auto align-items-lg-center">
                            <Link className="nav-link" to="/">Home</Link>
                            <Link className="nav-link" to="/booking">Book a Room</Link>

                            {user && (
                                <Link className="nav-link" to="/my-bookings">
                                    My Bookings
                                </Link>
                            )}

                            {user?.role === 'admin' && (
                                <Link className="nav-link" to="/admin">
                                    Admin Dashboard
                                </Link>
                            )}

                            {user ? (
                                <>
                                    <span className="text-white mx-3">
                                        Welcome, {user.name}
                                    </span>
                                    <button
                                        className="btn btn-outline-light btn-sm"
                                        onClick={onLogout}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-outline-light btn-sm me-2"
                                        onClick={onLogin}
                                    >
                                        Login
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={onRegister}
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <header
                className="text-white text-center d-flex align-items-center"
                style={{
                    minHeight: '520px',
                    background: 'linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600) center/cover'
                }}
            >
                <div className="container py-5">
                    <h1 className="display-3 fw-bold">
                        Welcome to Coastal Haven
                    </h1>
                    <p className="lead mt-3">
                        Experience comfort, relaxation and unforgettable coastal stays in Jaffna.
                    </p>
                    <Link to="/booking" className="btn btn-primary btn-lg mt-3">
                        Explore Rooms
                    </Link>
                </div>
            </header>

            <section className="container py-5" id="rooms">
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Explore Our Rooms</h2>
                    <p className="text-muted">
                        Discover comfortable accommodation for your perfect coastal getaway.
                    </p>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-dark"></div>
                        <p className="mt-3">Loading rooms...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {!loading && !error && rooms.length === 0 && (
                    <p className="text-center text-muted">
                        No rooms are currently available.
                    </p>
                )}

                <div className="row g-4">
                    {rooms.map((room) => (
                        <div className="col-md-4" key={room.id}>
                            <div className="card h-100 shadow-sm">
                                {room.image ? (
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${room.image}`}
                                        alt={room.name}
                                        className="card-img-top"
                                        style={{
                                            height: '230px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="bg-light d-flex justify-content-center align-items-center"
                                        style={{ height: '230px' }}
                                    >
                                        No image available
                                    </div>
                                )}

                                <div className="card-body d-flex flex-column">
                                    <h5 className="fw-bold">{room.name}</h5>
                                    <p className="text-muted">
                                        {room.description}
                                    </p>

                                    <p>
                                        <i className="bi bi-people me-2"></i>
                                        Capacity: {room.capacity} guests
                                    </p>

                                    <h5 className="fw-bold">
                                        LKR {Number(room.price_per_night).toLocaleString()}
                                        <small className="text-muted fs-6">
                                            {' '}/ night
                                        </small>
                                    </h5>

                                    <Link
                                        to="/booking"
                                        className="btn btn-dark mt-auto"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-light py-5">
                <div className="container text-center">
                    <h2 className="fw-bold">Why Choose Coastal Haven?</h2>
                    <div className="row g-4 mt-3">
                        <div className="col-md-4">
                            <i className="bi bi-house-heart fs-1"></i>
                            <h5 className="mt-3">Comfortable Rooms</h5>
                            <p className="text-muted">
                                Enjoy relaxing and welcoming accommodation.
                            </p>
                        </div>

                        <div className="col-md-4">
                            <i className="bi bi-calendar-check fs-1"></i>
                            <h5 className="mt-3">Easy Booking</h5>
                            <p className="text-muted">
                                Search availability and reserve your stay online.
                            </p>
                        </div>

                        <div className="col-md-4">
                            <i className="bi bi-shield-check fs-1"></i>
                            <h5 className="mt-3">Secure Reservations</h5>
                            <p className="text-muted">
                                Manage your bookings through your account.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-dark text-white text-center py-4">
                <div className="container">
                    <h5 className="fw-bold">Coastal Haven – Jaffna</h5>
                    <p className="mb-1">
                        Your perfect coastal getaway.
                    </p>
                    <small>
                        © {new Date().getFullYear()} Coastal Haven. All rights reserved.
                    </small>
                </div>
            </footer>
        </>
    );
}

export default Home;
