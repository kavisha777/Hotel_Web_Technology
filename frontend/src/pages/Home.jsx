
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/rooms');
                setRooms(response.data);
            } catch (err) {
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

    return (
        <>
            {/* Hero Section */}
            <section
                className="text-white d-flex align-items-center"
                style={{
                    minHeight: '75vh',
                    backgroundImage:
                        "linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container py-5">
                    <div className="col-lg-8">
                        <p className="text-uppercase fw-semibold">
                            Welcome to Coastal Haven
                        </p>

                        <h1 className="display-3 fw-bold">
                            Your Perfect Coastal Escape
                        </h1>

                        <p className="lead my-4">
                            Discover peaceful accommodation, beautiful coastal
                            surroundings and memorable holiday experiences.
                        </p>

                        <Link
                            to="/booking"
                            className="btn btn-primary btn-lg me-2"
                        >
                            Book Your Stay
                        </Link>

                        <a
                            href="#rooms"
                            className="btn btn-outline-light btn-lg"
                        >
                            Explore Rooms
                        </a>
                    </div>
                </div>
            </section>

            {/* Introduction */}
            <section className="py-5">
                <div className="container">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-6">
                            <img
                                src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=85"
                                alt="Beautiful coastal resort"
                                className="img-fluid rounded shadow"
                            />
                        </div>

                        <div className="col-lg-6">
                            <p className="text-primary fw-semibold">
                                ABOUT COASTAL HAVEN
                            </p>

                            <h2 className="fw-bold">
                                Experience Comfort by the Coast
                            </h2>

                            <p className="text-muted">
                                Coastal Haven is a welcoming holiday
                                accommodation concept designed for guests
                                seeking relaxation, comfort and a memorable
                                coastal experience.
                            </p>

                            <p className="text-muted">
                                Choose from our carefully presented room
                                options, check availability and submit your
                                reservation online.
                            </p>

                            <Link to="/booking" className="btn btn-primary">
                                Find Your Room
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Facilities */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <p className="text-primary fw-semibold">
                            OUR FACILITIES
                        </p>
                        <h2 className="fw-bold">Everything for Your Comfort</h2>
                    </div>

                    <div className="row g-4">
                        {facilities.map((facility) => (
                            <div className="col-md-6 col-lg-4" key={facility.title}>
                                <div className="card border-0 shadow-sm h-100 p-4">
                                    <div className="fs-1 mb-3">
                                        {facility.icon}
                                    </div>

                                    <h5 className="fw-bold">
                                        {facility.title}
                                    </h5>

                                    <p className="text-muted mb-0">
                                        {facility.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rooms */}
            <section className="py-5" id="rooms">
                <div className="container">
                    <div className="text-center mb-5">
                        <p className="text-primary fw-semibold">
                            ACCOMMODATION
                        </p>

                        <h2 className="fw-bold">Explore Our Rooms</h2>

                        <p className="text-muted">
                            Find the perfect accommodation for your stay.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" />
                            <p className="mt-3">Loading rooms...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : rooms.length === 0 ? (
                        <p className="text-center text-muted">
                            No rooms are currently available.
                        </p>
                    ) : (
                        <div className="row g-4">
                            {rooms.map((room) => (
                                <div
                                    className="col-md-6 col-lg-4"
                                    key={room.id}
                                >
                                    <div className="card h-100 shadow-sm border-0">
                                        {room.image && (
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${room.image}`}
                                                alt={room.name}
                                                className="card-img-top"
                                                style={{
                                                    height: '230px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        )}

                                        <div className="card-body d-flex flex-column">
                                            <h5 className="fw-bold">
                                                {room.name}
                                            </h5>

                                            <p className="text-muted small">
                                                {room.room_type}
                                            </p>

                                            <p>{room.description}</p>

                                            <p className="mb-2">
                                                <strong>Maximum Guests:</strong>{' '}
                                                {room.capacity}
                                            </p>

                                            {Array.isArray(room.facilities) && (
                                                <p className="small text-muted">
                                                    {room.facilities.join(' • ')}
                                                </p>
                                            )}

                                            <div className="mt-auto">
                                                <h5 className="text-primary fw-bold">
                                                    LKR{' '}
                                                    {Number(
                                                        room.price_per_night
                                                    ).toLocaleString('en-GB')}
                                                    <small className="text-muted fs-6">
                                                        {' '}/ night
                                                    </small>
                                                </h5>

                                                <Link
                                                    to="/booking"
                                                    className="btn btn-primary w-100"
                                                >
                                                    Book Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-5 text-white text-center bg-dark">
                <div className="container">
                    <h2 className="fw-bold">
                        Ready for Your Next Holiday?
                    </h2>

                    <p className="lead">
                        Find your ideal room and make your reservation today.
                    </p>

                    <Link to="/booking" className="btn btn-primary btn-lg">
                        Book Your Stay
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Home;
