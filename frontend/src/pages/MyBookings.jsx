
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/my-bookings');
            setBookings(response.data.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const cancelBooking = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this booking?'
        );

        if (!confirmed) return;

        try {
            await api.patch(`/bookings/${id}/cancel`);
            setMessage('Booking cancelled successfully.');
            fetchBookings();
        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to cancel this booking.'
            );
        }
    };

    const statusClass = (status) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'warning';
        }
    };

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold">My Bookings</h2>
                    <p className="text-muted">
                        View and manage your room reservations.
                    </p>
                </div>
                <Link to="/booking" className="btn btn-dark">
                    Book a Room
                </Link>
            </div>

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-dark"></div>
                    <p className="mt-3">Loading bookings...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="card text-center p-5 shadow-sm">
                    <i className="bi bi-calendar-x fs-1 text-muted"></i>
                    <h5 className="mt-3">No bookings found</h5>
                    <p className="text-muted">
                        You haven't made any reservations yet.
                    </p>
                    <Link to="/booking" className="btn btn-dark mx-auto">
                        Explore Rooms
                    </Link>
                </div>
            ) : (
                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Room</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Guests</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="fw-semibold">
                                        {booking.room?.name || 'Room unavailable'}
                                    </td>
                                    <td>{booking.check_in}</td>
                                    <td>{booking.check_out}</td>
                                    <td>{booking.guests}</td>
                                    <td>
                                        LKR {Number(booking.total_price).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`badge bg-${statusClass(booking.status)}`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {['pending', 'confirmed'].includes(booking.status) && (
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => cancelBooking(booking.id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default MyBookings;
