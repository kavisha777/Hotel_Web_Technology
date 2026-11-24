
import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = {
    name: '',
    description: '',
    room_type: '',
    facilities: '',
    price_per_night: '',
    capacity: '',
    status: 'available',
    image: null,
};

function AdminDashboard() {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');

            const [roomResponse, bookingResponse] = await Promise.all([
                api.get('/rooms'),
                api.get('/admin/bookings'),
            ]);

            setRooms(roomResponse.data);
            setBookings(bookingResponse.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load the admin dashboard.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: name === 'image' ? files[0] : value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);

        const fileInput = document.getElementById('room-image');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const formData = new FormData();

            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('room_type', form.room_type);
            formData.append('price_per_night', form.price_per_night);
            formData.append('capacity', form.capacity);
            formData.append('status', form.status);

            const facilities = form.facilities
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            facilities.forEach((facility, index) => {
                formData.append(`facilities[${index}]`, facility);
            });

            if (form.image) {
                formData.append('image', form.image);
            }

            if (editingId) {
                formData.append('_method', 'PUT');

                await api.post(
                    `/admin/rooms/${editingId}`,
                    formData
                );

                setMessage('Room updated successfully.');
            } else {
                await api.post('/admin/rooms', formData);

                setMessage('Room added successfully.');
            }

            resetForm();
            await loadDashboard();
        } catch (err) {
            const errors = err.response?.data?.errors;

            setError(
                errors
                    ? Object.values(errors).flat().join(' ')
                    : err.response?.data?.message ||
                      'Unable to save the room.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (room) => {
        setEditingId(room.id);

        setForm({
            name: room.name || '',
            description: room.description || '',
            room_type: room.room_type || '',
            facilities: Array.isArray(room.facilities)
                ? room.facilities.join(', ')
                : '',
            price_per_night: room.price_per_night || '',
            capacity: room.capacity || '',
            status: room.status || 'available',
            image: null,
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room?')) {
            return;
        }

        try {
            setError('');
            setMessage('');

            await api.delete(`/admin/rooms/${roomId}`);

            setMessage('Room deleted successfully.');
            await loadDashboard();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete this room.'
            );
        }
    };

    const handleBookingStatus = async (bookingId, status) => {
        const action = status === 'confirmed' ? 'confirm' : 'cancel';

        if (!window.confirm(`Are you sure you want to ${action} this booking?`)) {
            return;
        }

        try {
            setError('');
            setMessage('');

            const response = await api.patch(
                `/admin/bookings/${bookingId}/status`,
                { status }
            );

            setMessage(response.data.message || 'Booking status updated.');
            await loadDashboard();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to update the booking.'
            );
        }
    };

    const pendingBookings = bookings.filter(
        (booking) => booking.status === 'pending'
    ).length;

    const confirmedBookings = bookings.filter(
        (booking) => booking.status === 'confirmed'
    ).length;

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="mb-4">
                <h1 className="fw-bold">Admin Dashboard</h1>
                <p className="text-muted">
                    Manage rooms and customer bookings.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {message && (
                <div className="alert alert-success">{message}</div>
            )}

            {/* Dashboard Statistics */}
            <div className="row g-3 mb-5">
                <div className="col-md-3">
                    <div className="card shadow-sm p-3">
                        <h6 className="text-muted">Total Rooms</h6>
                        <h2>{rooms.length}</h2>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm p-3">
                        <h6 className="text-muted">Total Bookings</h6>
                        <h2>{bookings.length}</h2>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm p-3">
                        <h6 className="text-muted">Pending Bookings</h6>
                        <h2>{pendingBookings}</h2>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm p-3">
                        <h6 className="text-muted">Confirmed Bookings</h6>
                        <h2>{confirmedBookings}</h2>
                    </div>
                </div>
            </div>

            {/* Room Form */}
            <div className="card shadow-sm mb-5">
                <div className="card-header bg-dark text-white py-3">
                    <h4 className="mb-0">
                        {editingId ? 'Edit Room' : 'Add New Room'}
                    </h4>
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">
                                    Room Name
                                </label>
                                <input
                                    className="form-control"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Room Type
                                </label>
                                <input
                                    className="form-control"
                                    name="room_type"
                                    value={form.room_type}
                                    onChange={handleChange}
                                    placeholder="e.g. Deluxe Room"
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">
                                    Description
                                </label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows="3"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">
                                    Facilities
                                </label>
                                <input
                                    className="form-control"
                                    name="facilities"
                                    value={form.facilities}
                                    onChange={handleChange}
                                    placeholder="Wi-Fi, Air Conditioning, Balcony"
                                />
                                <small className="text-muted">
                                    Separate each facility with a comma.
                                </small>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">
                                    Price per Night (LKR)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="form-control"
                                    name="price_per_night"
                                    value={form.price_per_night}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">
                                    Maximum Guests
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">
                                    Room Status
                                </label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label">
                                    Room Image
                                </label>
                                <input
                                    id="room-image"
                                    type="file"
                                    className="form-control"
                                    name="image"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleChange}
                                />
                                <small className="text-muted">
                                    Accepted formats: JPG, PNG and WEBP.
                                    Leave empty when keeping the existing image.
                                </small>
                            </div>

                            <div className="col-12 d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving
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
                </div>
            </div>

            {/* Room Management */}
            <h3 className="fw-bold mb-3">Manage Rooms</h3>

            <div className="row g-4 mb-5">
                {rooms.map((room) => (
                    <div className="col-md-6 col-lg-4" key={room.id}>
                        <div className="card h-100 shadow-sm">
                            {room.image && (
                                <img
                                    src={`http://127.0.0.1:8000/storage/${room.image}`}
                                    className="card-img-top"
                                    alt={room.name}
                                    style={{
                                        height: '200px',
                                        objectFit: 'cover',
                                    }}
                                />
                            )}

                            <div className="card-body">
                                <h5>{room.name}</h5>
                                <p className="text-muted">{room.room_type}</p>
                                <p>{room.description}</p>
                                <p>
                                    <strong>Price:</strong> LKR{' '}
                                    {Number(room.price_per_night).toLocaleString()}
                                    {' / night'}
                                </p>
                                <p>
                                    <strong>Capacity:</strong> {room.capacity} guests
                                </p>
                                <p>
                                    <strong>Status:</strong> {room.status}
                                </p>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(room)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(room.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {rooms.length === 0 && (
                    <p className="text-muted">No rooms have been added yet.</p>
                )}
            </div>

            {/* Booking Management */}
            <h3 className="fw-bold mb-3">Manage Bookings</h3>

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Guest</th>
                            <th>Contact</th>
                            <th>Room</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Guests</th>
                            <th>Total (LKR)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>
                                    {booking.guest_name || booking.user?.name}
                                    <br />
                                    <small className="text-muted">
                                        {booking.guest_email || booking.user?.email}
                                    </small>
                                </td>

                                <td>
                                    {booking.guest_contact_number ||
                                        booking.user?.contact_number ||
                                        'Not provided'}
                                </td>

                                <td>{booking.room?.name || 'Room unavailable'}</td>
                                <td>{String(booking.check_in).slice(0, 10)}</td>
                                <td>{String(booking.check_out).slice(0, 10)}</td>
                                <td>{booking.guests}</td>
                                <td>
                                    {Number(booking.total_price).toLocaleString()}
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
                                    {booking.status !== 'cancelled' ? (
                                        <div className="d-flex flex-column gap-2">
                                            {booking.status === 'pending' && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() =>
                                                        handleBookingStatus(
                                                            booking.id,
                                                            'confirmed'
                                                        )
                                                    }
                                                >
                                                    Confirm
                                                </button>
                                            )}

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleBookingStatus(
                                                        booking.id,
                                                        'cancelled'
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-muted">No actions</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
