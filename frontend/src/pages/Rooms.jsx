
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// A separate fallback image for each room.
const fallbackImages = [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85',
];

function Rooms({ onBookNow }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/rooms');

                const roomData = Array.isArray(response.data)
                    ? response.data
                    : response.data.rooms || response.data.data || [];

                setRooms(roomData);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load rooms. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const getImageUrl = (image) => {
        if (!image) return '';

        if (image.startsWith('http')) {
            return image;
        }

        return `http://127.0.0.1:8000/storage/${image}`;
    };

    const getFallbackImage = (index) => {
        return fallbackImages[index % fallbackImages.length];
    };

    if (loading) {
        return (
            <div className="container text-center py-5">
                <p>Loading available rooms...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold">Explore Our Rooms</h1>
                <p className="text-muted">
                    Find the perfect room for your coastal getaway.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {!error && rooms.length === 0 && (
                <div className="alert alert-info text-center">
                    No rooms are currently available.
                </div>
            )}

            <div className="row g-4">
                {rooms.map((room, index) => (
                    <div className="col-md-6 col-lg-4" key={room.id}>
                        <div className="card h-100 shadow-sm border-0">
                            <img
                                src={
                                    getImageUrl(room.image) ||
                                    getFallbackImage(index)
                                }
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src =
                                        getFallbackImage(index);
                                }}
                                className="card-img-top"
                                alt={room.name}
                                style={{
                                    height: '230px',
                                    objectFit: 'cover',
                                }}
                            />

                            <div className="card-body d-flex flex-column">
                                <h4 className="card-title">
                                    {room.name}
                                </h4>

                                {room.room_type && (
                                    <p className="text-primary mb-2">
                                        {room.room_type}
                                    </p>
                                )}

                                <p className="card-text text-muted">
                                    {room.description}
                                </p>

                                <p className="mb-2">
                                    <strong>Maximum guests:</strong>{' '}
                                    {room.capacity}
                                </p>

                                {Array.isArray(room.facilities) &&
                                    room.facilities.length > 0 && (
                                        <div className="mb-3">
                                            <strong>Facilities:</strong>
                                            <ul className="mt-2">
                                                {room.facilities.map(
                                                    (facility, facilityIndex) => (
                                                        <li key={facilityIndex}>
                                                            {facility}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                <div className="mt-auto">
                                    <h5 className="text-primary fw-bold">
                                        LKR{' '}
                                        {Number(
                                            room.price_per_night
                                        ).toLocaleString('en-LK')}
                                        <small className="text-muted fw-normal">
                                            {' '}/ night
                                        </small>
                                    </h5>

                                    <button
                                        className="btn btn-primary w-100 mt-2"
                                        onClick={() => onBookNow(room.id)}
                                        disabled={room.status !== 'available'}
                                    >
                                        {room.status === 'available'
                                            ? 'Book Now'
                                            : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-5">
                <Link to="/" className="btn btn-outline-secondary">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default Rooms;
