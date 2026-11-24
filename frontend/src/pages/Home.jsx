
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home({ onBookNow }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fallbackImages = [
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
    ];

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/rooms');

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.rooms || response.data.data || [];

                setRooms(data);
            } catch (err) {
                console.error('Room loading error:', err);
                setError('Unable to load rooms. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const facilities = [
        {
            icon: '🌊',
            title: 'Ocean Views',
            description: 'Enjoy beautiful coastal scenery and relaxing sea views.',
        },
        {
            icon: '📶',
            title: 'Free Wi-Fi',
            description: 'Stay connected throughout your holiday.',
        },
        {
            icon: '❄️',
            title: 'Air Conditioning',
            description: 'Relax in comfortable, air-conditioned accommodation.',
        },
        {
            icon: '🏖️',
            title: 'Beach Access',
            description: 'Enjoy a peaceful coastal holiday close to the beach.',
        },
        {
            icon: '🍽️',
            title: 'Dining Facilities',
            description: 'Enjoy convenient dining during your stay.',
        },
        {
            icon: '🌴',
            title: 'Tropical Gardens',
            description: 'Unwind in beautiful tropical surroundings.',
        },
    ];

    const getRoomImage = (image, index) => {
        if (!image) {
            return fallbackImages[index % fallbackImages.length];
        }

        if (image.startsWith('http')) {
            return image;
        }

        return `http://127.0.0.1:8000/storage/${image}`;
    };

    return (
        <>
            {/* HERO */}
            <section
                className="text-white d-flex align-items-center"
                style={{
                    minHeight: '80vh',
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container py-5">
                    <div className="col-lg-8">
                        <p className="text-uppercase fw-semibold mb-3">
                            Welcome to Coastal Haven
                        </p>

                        <h1 className="display-3 fw-bold">
                            Your Perfect Coastal Escape
                        </h1>

                        <p className="lead my-4">
                            Discover peaceful accommodation, beautiful coastal
                            surroundings and unforgettable holiday experiences.
                            Your relaxing getaway starts here.
                        </p>

                        <Link to="/rooms" className="btn btn-primary btn-lg me-2 mb-2">
                            Book Your Stay
                        </Link>

                        <Link to="/rooms" className="btn btn-outline-light btn-lg mb-2">
                            Explore Rooms
                        </Link>
                    </div>
                </div>
            </section>

            {/* INTRODUCTION */}
            <section className="py-5">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <img
                                src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=85"
                                alt="Coastal holiday accommodation"
                                className="img-fluid rounded shadow"
                                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            />
                        </div>

                        <div className="col-lg-6">
                            <p className="text-primary fw-semibold text-uppercase">
                                About Coastal Haven
                            </p>

                            <h2 className="display-6 fw-bold mb-4">
                                Experience Comfort by the Coast
                            </h2>

                            <p className="text-muted">
                                Coastal Haven is a welcoming coastal accommodation
                                destination designed for guests seeking relaxation,
                                comfort and memorable holiday experiences.
                            </p>

                            <p className="text-muted">
                                Explore our rooms, check availability and reserve
                                your preferred accommodation through our online
                                booking system.
                            </p>

                            <Link to="/rooms" className="btn btn-primary mt-3">
                                Find Your Room
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FACILITIES */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <p className="text-primary fw-semibold text-uppercase">
                            Our Facilities
                        </p>
                        <h2 className="fw-bold display-6">
                            Everything for Your Comfort
                        </h2>
                        <p className="text-muted">
                            Enjoy convenient facilities during your stay.
                        </p>
                    </div>

                    <div className="row g-4">
                        {facilities.map((facility) => (
                            <div className="col-md-6 col-lg-4" key={facility.title}>
                                <div className="card border-0 shadow-sm h-100 p-4 text-center">
                                    <div className="display-4 mb-3">
                                        {facility.icon}
                                    </div>
                                    <h5 className="fw-bold">{facility.title}</h5>
                                    <p className="text-muted mb-0">
                                        {facility.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED ROOMS */}
            <section className="py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <p className="text-primary fw-semibold text-uppercase">
                            Our Accommodation
                        </p>
                        <h2 className="fw-bold display-6">
                            Discover Our Featured Rooms
                        </h2>
                        <p className="text-muted">
                            Take a first look at our accommodation options.
                        </p>
                    </div>

                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="mt-3 text-muted">Loading rooms...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="alert alert-danger text-center">{error}</div>
                    )}

                    {!loading && !error && rooms.length === 0 && (
                        <div className="alert alert-info text-center">
                            No rooms are currently available.
                        </div>
                    )}

                    {!loading && !error && rooms.length > 0 && (
                        <div className="row g-4">
                            {rooms.slice(0, 3).map((room, index) => (
                                <div className="col-md-6 col-lg-4" key={room.id}>
                                    <div className="card h-100 shadow-sm border-0">
                                        <img
                                            src={getRoomImage(room.image, index)}
                                            alt={room.name}
                                            className="card-img-top"
                                            style={{
                                                height: '240px',
                                                objectFit: 'cover',
                                            }}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src =
                                                    fallbackImages[index % fallbackImages.length];
                                            }}
                                        />

                                        <div className="card-body d-flex flex-column">
                                            <h5 className="fw-bold">{room.name}</h5>

                                            <p className="text-primary small fw-semibold">
                                                {room.room_type || 'Accommodation'}
                                            </p>

                                            <p className="text-muted">
                                                {room.description}
                                            </p>

                                            <p>
                                                <strong>Maximum guests:</strong>{' '}
                                                {room.capacity}
                                            </p>

                                            <div className="mt-auto">
                                                <h5 className="text-primary fw-bold">
                                                    LKR{' '}
                                                    {Number(room.price_per_night).toLocaleString('en-LK')}
                                                    <small className="text-muted fs-6 fw-normal">
                                                        {' '}/ night
                                                    </small>
                                                </h5>

                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-100"
                                                    disabled={room.status !== 'available'}
                                                    onClick={() => onBookNow?.(room.id)}
                                                >
                                                    {room.status === 'available'
                                                        ? 'Book This Room'
                                                        : 'Unavailable'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-5">
                        <Link to="/rooms" className="btn btn-outline-primary btn-lg">
                            View All Rooms
                        </Link>
                    </div>
                </div>
            </section>

            {/* BOOKING PROCESS */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <p className="text-primary fw-semibold text-uppercase">
                            Simple Reservations
                        </p>
                        <h2 className="fw-bold display-6">
                            Book Your Stay in Three Steps
                        </h2>
                    </div>

                    <div className="row g-4 text-center">
                        {[
                            {
                                number: '01',
                                title: 'Choose Your Room',
                                description: 'Explore our accommodation options and select your preferred room.',
                            },
                            {
                                number: '02',
                                title: 'Check Availability',
                                description: 'Enter your travel dates and number of guests.',
                            },
                            {
                                number: '03',
                                title: 'Submit Your Booking',
                                description: 'Review your booking details and submit your reservation request.',
                            },
                        ].map((step) => (
                            <div className="col-md-4" key={step.number}>
                                <div className="bg-white rounded shadow-sm p-4 h-100">
                                    <div className="display-4 text-primary mb-3">
                                        {step.number}
                                    </div>
                                    <h5 className="fw-bold">{step.title}</h5>
                                    <p className="text-muted mb-0">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION */}
            <section
                className="py-5 text-white text-center"
                style={{
                    background:
                        'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1800&q=85) center/cover',
                }}
            >
                <div className="container py-4">
                    <h2 className="fw-bold display-6">
                        Ready for Your Next Holiday?
                    </h2>
                    <p className="lead my-3">
                        Discover your ideal room and enjoy a relaxing coastal
                        getaway with Coastal Haven.
                    </p>
                    <Link to="/rooms" className="btn btn-primary btn-lg mt-2">
                        Explore Available Rooms
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-dark text-white py-4">
                <div className="container text-center">
                    <h5 className="fw-bold">COASTAL HAVEN</h5>
                    <p className="text-white-50 mb-2">
                        Your Perfect Coastal Escape
                    </p>
                    <p className="small text-white-50 mb-0">
                        © {new Date().getFullYear()} Coastal Haven. All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}

export default Home;
