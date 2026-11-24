
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    const fetchBookings = async () => {
        try {
            setError('');

            const response = await api.get('/my-bookings');
            setBookings(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to retrieve your bookings.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this booking?'
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');
            setCancellingId(bookingId);

            const response = await api.patch(
                `/bookings/${bookingId}/cancel`
            );

            setMessage(
                response.data.message ||
                'Your booking has been cancelled successfully.'
            );

            await fetchBookings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to cancel this booking.'
            );
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-success';

            case 'cancelled':
                return 'bg-danger';

            default:
                return 'bg-warning text-dark';
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold">My Bookings</h1>
                    <p className="text-muted">
                        View and manage your villa reservations.
                    </p>
                </div>

                <Link to="/booking" className="btn btn-primary">
                    Make a New Booking
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="card shadow-sm text-center p-5">
                    <h4>No bookings yet</h4>

                    <p className="text-muted">
                        You have not made any reservations.
                    </p>

                    <div>
                        <Link to="/booking" className="btn btn-primary">
                            Explore Available Rooms
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Room</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Guests</th>
                                <th>Total (LKR)</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bookings.map((booking) => {
                                const canCancel =
                                    ['pending', 'confirmed'].includes(
                                        booking.status
                                    ) &&
                                    String(booking.check_in).slice(0, 10) >
                                    new Date().toLocaleDateString('en-CA');

                                return (
                                    <tr key={booking.id}>
                                        <td>
                                            <strong>
                                                {booking.room?.name ||
                                                    'Room unavailable'}
                                            </strong>
                                        </td>

                                        <td>
                                            {String(booking.check_in).slice(0, 10)}
                                        </td>

                                        <td>
                                            {String(booking.check_out).slice(0, 10)}
                                        </td>

                                        <td>{booking.guests}</td>

                                        <td>
                                            {Number(
                                                booking.total_price
                                            ).toLocaleString('en-GB')}
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${getStatusClass(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>

                                        <td>
                                            {canCancel ? (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        handleCancel(booking.id)
                                                    }
                                                    disabled={
                                                        cancellingId === booking.id
                                                    }
                                                >
                                                    {cancellingId === booking.id
                                                        ? 'Cancelling...'
                                                        : 'Cancel Booking'}
                                                </button>
                                            ) : (
                                                <span className="text-muted">
                                                    No actions
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="alert alert-info mt-4">
                <strong>Cancellation policy:</strong> You can cancel pending
                or confirmed bookings before the check-in date. Bookings
                cannot be cancelled on or after the check-in date.
            </div>
        </div>
    );
}

export default MyBookings;
