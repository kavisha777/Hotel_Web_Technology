
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Booking({ user, onLogin, onRegister }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        check_in: '',
        check_out: '',
        guests: 1,
    });

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const today = new Date().toLocaleDateString('en-CA');

    const nights = form.check_in && form.check_out
        ? Math.max(
            0,
            Math.round(
                (new Date(form.check_out + 'T00:00:00') -
                new Date(form.check_in + 'T00:00:00')) / 86400000
            )
        )
        : 0;

    const total = selectedRoom
        ? nights * Number(selectedRoom.price_per_night)
        : 0;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const searchRooms = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSelectedRoom(null);
        setRooms([]);

        if (!form.check_in || !form.check_out ||
            form.check_out <= form.check_in) {
            setError('Please select valid check-in and check-out dates.');
            return;
        }

        try {
            setLoading(true);

            const response = await api.get('/availability', {
                params: form,
            });

            setRooms(response.data.data);

            if (response.data.data.length === 0) {
                setMessage('No available rooms found for these dates.');
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
    onLogin();
    return;
}
        if (!selectedRoom) {
            setError('Please select a room.');
            return;
        }

        try {
            setLoading(true);
            

            const response = await api.post('/bookings', {
                room_id: selectedRoom.id,
                check_in: form.check_in,
                check_out: form.check_out,
                guests: Number(form.guests),
            });

            setMessage(response.data.message);

            setTimeout(() => {
                navigate('/my-bookings');
            }, 1000);
        } catch (err) {
            setError(
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(' ')
                    : err.response?.data?.message ||
                      'Booking failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-2">Find Your Perfect Stay</h2>
            <p className="text-muted mb-4">
                Choose your dates and discover available rooms.
            </p>
{!user && (
    <div className="alert alert-info d-flex justify-content-between align-items-center">
        <span>Please log in before confirming your booking.</span>

        <div>
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
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-info">{message}</div>}

            <form onSubmit={searchRooms} className="card p-4 shadow-sm mb-5">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Check-in</label>
                        <input
                            type="date"
                            name="check_in"
                            className="form-control"
                            min={today}
                            value={form.check_in}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Check-out</label>
                        <input
                            type="date"
                            name="check_out"
                            className="form-control"
                            min={form.check_in || today}
                            value={form.check_out}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label">Guests</label>
                        <input
                            type="number"
                            name="guests"
                            className="form-control"
                            min="1"
                            value={form.guests}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-2 d-flex align-items-end">
                        <button
                            className="btn btn-dark w-100"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="row g-4">
                {rooms.map((room) => (
                    <div className="col-md-4" key={room.id}>
                        <div className="card h-100 shadow-sm">
                             {room.image && (
    <img
        src={`http://127.0.0.1:8000/storage/${room.image}`}
        alt={room.name}
        className="card-img-top"
        style={{ height: '200px', objectFit: 'cover' }}
    />
)}
                            <div className="card-body">
                               
                                <h5 className="fw-bold">{room.name}</h5>
                                <p className="text-muted">
                                    {room.description}
                                </p>
                                <p>Capacity: {room.capacity} guests</p>
                                <h5>
                                    LKR {Number(room.price_per_night).toLocaleString()}
                                    <small className="text-muted fs-6">
                                        {' '} / night
                                    </small>
                                </h5>

                                <button
                                    className={`btn w-100 ${
                                        selectedRoom?.id === room.id
                                            ? 'btn-success'
                                            : 'btn-outline-dark'
                                    }`}
                                    onClick={() => setSelectedRoom(room)}
                                >
                                    {selectedRoom?.id === room.id
                                        ? 'Selected'
                                        : 'Select Room'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRoom && (
                <div className="card shadow-sm p-4 mt-5">
                    <h4>Booking Summary</h4>
                    <p>Room: {selectedRoom.name}</p>
                    <p>Number of nights: {nights}</p>
                    <p>
                        Price per night: LKR{' '}
                        {Number(selectedRoom.price_per_night).toLocaleString()}
                    </p>
                    <h4 className="mb-3">
                        Total: LKR {total.toLocaleString()}
                    </h4>

                    <button
                        className="btn btn-dark"
                        onClick={makeBooking}
                        disabled={loading || nights <= 0}
                    >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Booking;
