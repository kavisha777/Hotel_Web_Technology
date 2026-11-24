
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Booking({ user, onLogin, onRegister }) {
    const [formData, setFormData] = useState({
        guest_name: user?.name || '',
        guest_email: user?.email || '',
        guest_contact_number: user?.contact_number || '',
        check_in: '',
        check_out: '',
        guests: 1,
    });

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData((previous) => ({
            ...previous,
            guest_name: user?.name || '',
            guest_email: user?.email || '',
            guest_contact_number: user?.contact_number || '',
        }));
    }, [user]);

    const calculateNights = () => {
        if (!formData.check_in || !formData.check_out) {
            return 0;
        }

        const start = new Date(`${formData.check_in}T00:00:00`);
        const end = new Date(`${formData.check_out}T00:00:00`);

        const difference = end.getTime() - start.getTime();

        return difference > 0
            ? difference / (1000 * 60 * 60 * 24)
            : 0;
    };

    const nights = calculateNights();

    const totalPrice = selectedRoom
        ? nights * Number(selectedRoom.price_per_night)
        : 0;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError('');
        setMessage('');

        if (name === 'check_in' || name === 'check_out' || name === 'guests') {
            setRooms([]);
            setSelectedRoom(null);
        }
    };

    const searchAvailability = async (e) => {
        e.preventDefault();

        setError('');
        setMessage('');
        setRooms([]);
        setSelectedRoom(null);

        const today = new Date();
        const todayString = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0'),
        ].join('-');

        if (formData.check_in < todayString) {
            setError('Check-in date cannot be in the past.');
            return;
        }

        if (formData.check_out <= formData.check_in) {
            setError('Check-out must be after check-in.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.get('/availability', {
                params: {
                    check_in: formData.check_in,
                    check_out: formData.check_out,
                    guests: formData.guests,
                },
            });

            const availableRooms = response.data.rooms || [];

            setRooms(availableRooms);

            if (availableRooms.length === 0) {
                setMessage('No rooms are available for these dates.');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to search for available rooms.'
            );
        } finally {
            setLoading(false);
        }
    };

    const makeBooking = async () => {
        setError('');
        setMessage('');

        if (!user) {
            setError('Please log in or register before making a booking.');
            onLogin();
            return;
        }

        if (!selectedRoom) {
            setError('Please select a room.');
            return;
        }

        if (
            !formData.guest_name.trim() ||
            !formData.guest_email.trim() ||
            !formData.guest_contact_number.trim()
        ) {
            setError('Please complete all guest details.');
            return;
        }

        if (nights <= 0) {
            setError('Please select valid check-in and check-out dates.');
            return;
        }

        setBookingLoading(true);

        try {
            const response = await api.post('/bookings', {
                room_id: selectedRoom.id,
                guest_name: formData.guest_name,
                guest_email: formData.guest_email,
                guest_contact_number: formData.guest_contact_number,
                check_in: formData.check_in,
                check_out: formData.check_out,
                guests: Number(formData.guests),
            });

            setMessage(
                response.data.message ||
                'Your booking has been submitted successfully.'
            );

            setSelectedRoom(null);
            setRooms([]);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            if (validationErrors) {
                setError(Object.values(validationErrors).flat().join(' '));
            } else {
                setError(
                    err.response?.data?.message ||
                    'Unable to complete your booking.'
                );
            }
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="container py-5">

            <div className="text-center mb-5">
                <h1 className="fw-bold">Book Your Stay</h1>
                <p className="text-muted">
                    Find your perfect room at Coastal Haven.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {message && (
                <div className="alert alert-success">
                    {message}
                    {user && (
                        <div className="mt-2">
                            <Link to="/my-bookings">
                                View My Bookings
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {!user && (
                <div className="alert alert-info">
                    Please log in or register before confirming a booking.
                    <div className="mt-2">
                        <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={onLogin}
                        >
                            Login
                        </button>

                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={onRegister}
                        >
                            Register
                        </button>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">

                    <h4 className="mb-4">1. Search Availability</h4>

                    <form onSubmit={searchAvailability}>
                        <div className="row g-3">

                            <div className="col-md-4">
                                <label className="form-label">
                                    Check-in Date
                                </label>

                                <input
                                    type="date"
                                    name="check_in"
                                    className="form-control"
                                    value={formData.check_in}
                                    onChange={handleChange}
                                    min={new Date().toLocaleDateString('en-CA')}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">
                                    Check-out Date
                                </label>

                                <input
                                    type="date"
                                    name="check_out"
                                    className="form-control"
                                    value={formData.check_out}
                                    onChange={handleChange}
                                    min={formData.check_in || new Date().toLocaleDateString('en-CA')}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">
                                    Number of Guests
                                </label>

                                <input
                                    type="number"
                                    name="guests"
                                    className="form-control"
                                    min="1"
                                    max="20"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Searching...'
                                        : 'Search Available Rooms'}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>

            {rooms.length > 0 && (
                <div className="mb-5">

                    <h4 className="mb-4">2. Select Your Room</h4>

                    <div className="row g-4">
                        {rooms.map((room) => (
                            <div className="col-md-6 col-lg-4" key={room.id}>
                                <div className="card h-100 shadow-sm">

                                    {room.image && (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${room.image}`}
                                            className="card-img-top"
                                            alt={room.name}
                                            style={{
                                                height: '220px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    )}

                                    <div className="card-body">
                                        <h5>{room.name}</h5>

                                        <p className="text-muted">
                                            {room.description}
                                        </p>

                                        <p>
                                            <strong>Room Type:</strong>{' '}
                                            {room.room_type || 'Standard'}
                                        </p>

                                        <p>
                                            <strong>Capacity:</strong>{' '}
                                            {room.capacity} guests
                                        </p>

                                        <p>
                                            <strong>Facilities:</strong>{' '}
                                            {(room.facilities || []).join(', ') || 'Not specified'}
                                        </p>

                                        <h5 className="text-primary">
                                            LKR {Number(room.price_per_night).toLocaleString('en-LK')}
                                            <small className="text-muted"> / night</small>
                                        </h5>

                                        <button
                                            className={`btn w-100 ${
                                                selectedRoom?.id === room.id
                                                    ? 'btn-success'
                                                    : 'btn-outline-primary'
                                            }`}
                                            onClick={() => {
                                                setSelectedRoom(room);
                                                setMessage('');
                                                setError('');
                                            }}
                                        >
                                            {selectedRoom?.id === room.id
                                                ? 'Selected'
                                                : 'Select This Room'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedRoom && (
                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">

                        <h4 className="mb-4">3. Guest Details & Booking Summary</h4>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            makeBooking();
                        }}>

                            <div className="row g-3">

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Guest Name
                                    </label>

                                    <input
                                        type="text"
                                        name="guest_name"
                                        className="form-control"
                                        value={formData.guest_name}
                                        onChange={handleChange}
                                        required
                                        maxLength={255}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        name="guest_email"
                                        className="form-control"
                                        value={formData.guest_email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Contact Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="guest_contact_number"
                                        className="form-control"
                                        value={formData.guest_contact_number}
                                        onChange={handleChange}
                                        required
                                        maxLength={30}
                                    />
                                </div>

                            </div>

                            <hr className="my-4" />

                            <h5>Booking Summary</h5>

                            <div className="row g-3 mt-1">

                                <div className="col-md-6">
                                    <p>
                                        <strong>Room:</strong>{' '}
                                        {selectedRoom.name}
                                    </p>

                                    <p>
                                        <strong>Check-in:</strong>{' '}
                                        {formData.check_in}
                                    </p>

                                    <p>
                                        <strong>Check-out:</strong>{' '}
                                        {formData.check_out}
                                    </p>
                                </div>

                                <div className="col-md-6">
                                    <p>
                                        <strong>Guests:</strong>{' '}
                                        {formData.guests}
                                    </p>

                                    <p>
                                        <strong>Nights:</strong>{' '}
                                        {nights}
                                    </p>

                                    <p>
                                        <strong>Price per night:</strong>{' '}
                                        LKR {Number(selectedRoom.price_per_night).toLocaleString('en-LK')}
                                    </p>
                                </div>

                            </div>

                            <div className="bg-light rounded p-3 my-3">
                                <h4 className="text-primary mb-0">
                                    Estimated Total: LKR{' '}
                                    {totalPrice.toLocaleString('en-LK')}
                                </h4>
                            </div>

                            <p className="text-muted small">
                                Your booking will remain pending until an
                                administrator confirms it. The final amount
                                is calculated and validated by the server.
                            </p>

                            <button
                                type="submit"
                                className="btn btn-success btn-lg"
                                disabled={bookingLoading}
                            >
                                {bookingLoading
                                    ? 'Submitting...'
                                    : 'Confirm Booking Request'}
                            </button>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Booking;
