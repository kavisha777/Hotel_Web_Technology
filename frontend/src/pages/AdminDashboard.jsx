
import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyRoom = {
    name: '',
    description: '',
    price_per_night: '',
    capacity: 1,
    status: 'available',
};

function AdminDashboard() {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [roomForm, setRoomForm] = useState(emptyRoom);
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const [roomResponse, bookingResponse] = await Promise.all([
                api.get('/rooms'),
                api.get('/admin/bookings'),
            ]);

            setRooms(roomResponse.data.data);
            setBookings(bookingResponse.data.data);
            setError('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load admin information.'
            );
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setRoomForm({
            ...roomForm,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setRoomForm(emptyRoom);
        setImageFile(null);
        setEditingId(null);

        const fileInput = document.getElementById('roomImage');
        if (fileInput) fileInput.value = '';
    };

    const saveRoom = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            setLoading(true);

            const formData = new FormData();

            Object.entries(roomForm).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editingId) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/rooms/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessage('Room updated successfully.');
            } else {
                await api.post('/admin/rooms', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessage('Room added successfully.');
            }

            resetForm();
            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(' ')
                    : err.response?.data?.message || 'Unable to save room.'
            );
        } finally {
            setLoading(false);
        }
    };

    const editRoom = (room) => {
        setEditingId(room.id);
        setRoomForm({
            name: room.name,
            description: room.description,
            price_per_night: room.price_per_night,
            capacity: room.capacity,
            status: room.status,
        });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteRoom = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room?')) {
            return;
        }

        try {
            await api.delete(`/admin/rooms/${id}`);
            setMessage('Room deleted successfully.');
            fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete this room. It may have bookings.'
            );
        }
    };

    const updateBookingStatus = async (id, status) => {
        try {
            await api.patch(`/admin/bookings/${id}/status`, { status });
            setMessage(`Booking ${status} successfully.`);
            setError('');
            fetchData();
        } catch (err) {
            setError(
                err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(' ')
                    : err.response?.data?.message ||
                    'Unable to update booking status.'
            );
        }
    };

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted mb-4">
                Manage rooms and customer reservations.
            </p>

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="row g-3 mb-5">
                <div className="col-md-4">
                    <div className="card shadow-sm p-4">
                        <h6 className="text-muted">Total Rooms</h6>
                        <h2>{rooms.length}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm p-4">
                        <h6 className="text-muted">Total Bookings</h6>
                        <h2>{bookings.length}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm p-4">
                        <h6 className="text-muted">Confirmed Bookings</h6>
                        <h2>
                            {bookings.filter(
                                booking => booking.status === 'confirmed'
                            ).length}
                        </h2>
                    </div>
                </div>
            </div>

            <section className="card shadow-sm p-4 mb-5">
                <h4 className="fw-bold mb-4">
                    {editingId ? 'Edit Room' : 'Add New Room'}
                </h4>

                <form onSubmit={saveRoom}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Room Name</label>
                            <input
                                className="form-control"
                                name="name"
                                value={roomForm.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Price Per Night (LKR)</label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="form-control"
                                name="price_per_night"
                                value={roomForm.price_per_night}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Guest Capacity</label>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                name="capacity"
                                value={roomForm.capacity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Room Status</label>
                            <select
                                className="form-select"
                                name="status"
                                value={roomForm.status}
                                onChange={handleChange}
                            >
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                name="description"
                                rows="3"
                                value={roomForm.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Room Image</label>
                            <input
                                type="file"
                                id="roomImage"
                                className="form-control"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                            <small className="text-muted">
                                JPG, PNG or WEBP. Maximum size: 2 MB.
                            </small>
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="btn btn-dark me-2"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Saving...'
                                    : editingId
                                    ? 'Update Room'
                                    : 'Add Room'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={resetForm}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            <section className="mb-5">
                <h4 className="fw-bold mb-3">Manage Rooms</h4>

                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Room</th>
                                <th>Price</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id}>
                                    <td>{room.name}</td>
                                    <td>
                                        LKR {Number(room.price_per_night).toLocaleString()}
                                    </td>
                                    <td>{room.capacity}</td>
                                    <td>
                                        <span className={`badge ${
                                            room.status === 'available'
                                                ? 'bg-success'
                                                : 'bg-secondary'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => editRoom(room)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteRoom(room.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {rooms.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No rooms found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h4 className="fw-bold mb-3">Manage Bookings</h4>

                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Customer</th>
                                <th>Room</th>
                                <th>Dates</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>
                                        {booking.user?.name}
                                        <br />
                                        <small className="text-muted">
                                            {booking.user?.email}
                                        </small>
                                    </td>

                                    <td>{booking.room?.name}</td>

                                    <td>
                                        {booking.check_in}
                                        <br />
                                        to {booking.check_out}
                                    </td>

                                    <td>
                                        LKR {Number(booking.total_price).toLocaleString()}
                                    </td>

                                    <td>
                                        <span className={`badge ${
                                            booking.status === 'confirmed'
                                                ? 'bg-success'
                                                : booking.status === 'cancelled'
                                                ? 'bg-danger'
                                                : 'bg-warning text-dark'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>

                                    <td>
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    className="btn btn-success btn-sm me-2 mb-1"
                                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                >
                                                    Confirm
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm mb-1"
                                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {booking.status === 'confirmed' && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;
