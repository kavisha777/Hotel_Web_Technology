
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';

function formatDate(date) {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function normaliseDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

function parseDate(value) {
    const normalised = normaliseDate(value);
    return normalised ? new Date(`${normalised}T12:00:00`) : null;
}

function getNextDay(dateString) {
    const date = parseDate(dateString);

    if (!date) return new Date();

    date.setDate(date.getDate() + 1);
    return date;
}

function getRoomCapacity(room) {
    if (!room) return 1;

    const capacity = Number(
        room.capacity ?? room.max_guests ?? room.maxGuests ?? 1
    );

    return Number.isFinite(capacity) && capacity >= 1
        ? Math.floor(capacity)
        : 1;
}

function Booking({ user, initialSelectedRoomId }) {
    const today = formatDate(new Date());

    const [guestName, setGuestName] = useState(user?.name || '');
    const [guestEmail, setGuestEmail] = useState(user?.email || '');
    const [guestContact, setGuestContact] = useState(
        user?.contact_number || ''
    );

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);

    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(
        initialSelectedRoomId ? String(initialSelectedRoomId) : ''
    );

    // Store the selected room even before availability is searched.
    const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
    const [loadingRoom, setLoadingRoom] = useState(false);

    const [bookedPeriods, setBookedPeriods] = useState([]);
    const [loadingBookedDates, setLoadingBookedDates] = useState(false);
    const [bookedDatesError, setBookedDatesError] = useState('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (initialSelectedRoomId) {
            setSelectedRoomId(String(initialSelectedRoomId));
        }
    }, [initialSelectedRoomId]);

    // Load selected room details and its maximum guest capacity.
    useEffect(() => {
        if (!selectedRoomId) {
            setSelectedRoomDetails(null);
            setLoadingRoom(false);
            setGuests(1);
            return;
        }

        let active = true;

        const fetchSelectedRoom = async () => {
            setLoadingRoom(true);

            try {
                const response = await api.get(`/rooms/${selectedRoomId}`);

                if (active) {
                    const room = response.data.room || response.data;

                    setSelectedRoomDetails(room);

                    const capacity = getRoomCapacity(room);

                    setGuests((currentGuests) =>
                        Math.min(Number(currentGuests) || 1, capacity)
                    );
                }
            } catch (err) {
                if (active) {
                    setSelectedRoomDetails(null);
                    setError(
                        'Unable to load the selected room details. Please try again.'
                    );
                }
            } finally {
                if (active) {
                    setLoadingRoom(false);
                }
            }
        };

        fetchSelectedRoom();

        return () => {
            active = false;
        };
    }, [selectedRoomId]);

    // Load occupied dates whenever the selected room changes.
    useEffect(() => {
        if (!selectedRoomId) {
            setBookedPeriods([]);
            setBookedDatesError('');
            return;
        }

        let active = true;

        const fetchBookedPeriods = async () => {
            setLoadingBookedDates(true);
            setBookedDatesError('');
            setBookedPeriods([]);

            try {
                const response = await api.get(
                    `/rooms/${selectedRoomId}/unavailable-dates`
                );

                if (active) {
                    const bookings = Array.isArray(response.data.bookings)
                        ? response.data.bookings
                        : [];

                    setBookedPeriods(
                        bookings.map((booking) => ({
                            check_in: normaliseDate(booking.check_in),
                            check_out: normaliseDate(booking.check_out),
                        }))
                    );
                }
            } catch (err) {
                if (active) {
                    setBookedDatesError(
                        err.response?.data?.message ||
                        'Unable to load this room’s booked dates. Please try again.'
                    );
                }
            } finally {
                if (active) {
                    setLoadingBookedDates(false);
                }
            }
        };

        fetchBookedPeriods();

        return () => {
            active = false;
        };
    }, [selectedRoomId]);

    // Prefer the selected room from availability results.
    // Otherwise use the room details loaded directly from the API.
    const selectedRoom =
        rooms.find(
            (room) => String(room.id) === String(selectedRoomId)
        ) || selectedRoomDetails;

    const maxGuests = getRoomCapacity(selectedRoom);

    const selectedRoomIsAvailable = rooms.some(
        (room) => String(room.id) === String(selectedRoomId)
    );

    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;

        const start = parseDate(checkIn);
        const end = parseDate(checkOut);

        return Math.max(
            0,
            Math.round((end - start) / (1000 * 60 * 60 * 24))
        );
    }, [checkIn, checkOut]);

    const totalPrice =
        selectedRoom && nights > 0
            ? Number(selectedRoom.price_per_night) * nights
            : 0;

    // Prevent check-in dates that are already occupied.
    const isCheckInDateAvailable = (date) => {
        const dateString = formatDate(date);

        return !bookedPeriods.some((booking) => (
            dateString >= booking.check_in &&
            dateString < booking.check_out
        ));
    };

    // Check-out must be after check-in and must not overlap
    // an existing pending or confirmed booking.
    const isCheckOutDateAvailable = (date) => {
        const dateString = formatDate(date);

        if (!checkIn || dateString <= checkIn) {
            return false;
        }

        return !bookedPeriods.some((booking) => (
            checkIn < booking.check_out &&
            dateString > booking.check_in
        ));
    };

    const hasBookingOverlap = (startDate, endDate) => {
        return bookedPeriods.some((booking) => (
            startDate < booking.check_out &&
            endDate > booking.check_in
        ));
    };

    // Update guest count safely according to selected room capacity.
    const handleGuestChange = (event) => {
        const value = Number(event.target.value);

        if (value >= 1 && value <= maxGuests) {
            setGuests(value);
            setSearched(false);
            setRooms([]);
            setError('');
            setMessage('');
        }
    };

    // Search available rooms.
    const searchAvailability = async (event) => {
        event.preventDefault();

        setError('');
        setMessage('');
        setSearched(false);

        if (!selectedRoomId) {
            setError('Please select a room from Explore Rooms first.');
            return;
        }

        if (loadingRoom) {
            setError('Please wait while room details are loading.');
            return;
        }

        if (!selectedRoom) {
            setError('Unable to load the selected room.');
            return;
        }

        if (bookedDatesError) {
            setError('The room booking calendar could not be loaded. Please try again.');
            return;
        }

        if (loadingBookedDates) {
            setError('Please wait while the room calendar loads.');
            return;
        }

        if (!checkIn || !checkOut) {
            setError('Please select both check-in and check-out dates.');
            return;
        }

        if (checkIn < today) {
            setError('Check-in date cannot be in the past.');
            return;
        }

        if (checkOut <= checkIn) {
            setError('Check-out date must be after check-in date.');
            return;
        }

        if (hasBookingOverlap(checkIn, checkOut)) {
            setError(
                'These dates overlap an existing booking. Please choose different dates.'
            );
            return;
        }

        if (guests < 1) {
            setError('Please select at least one guest.');
            return;
        }

        if (guests > maxGuests) {
            setError(
                `This room can accommodate a maximum of ${maxGuests} guests.`
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.get('/availability', {
                params: {
                    check_in: checkIn,
                    check_out: checkOut,
                    guests: Number(guests),
                },
            });

            const availableRooms = Array.isArray(response.data)
                ? response.data
                : response.data.rooms || response.data.data || [];

            setRooms(availableRooms);
            setSearched(true);

            const isAvailable = availableRooms.some(
                (room) => String(room.id) === String(selectedRoomId)
            );

            if (!isAvailable) {
                setMessage(
                    availableRooms.length > 0
                        ? 'Your selected room is unavailable for these dates. Please select another room.'
                        : 'No rooms are available for these dates and guest requirements.'
                );
            } else {
                setMessage(
                    'Your selected room is available for these dates.'
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not check availability. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Submit booking request.
    const handleBooking = async (event) => {
        event.preventDefault();

        setError('');
        setMessage('');

        if (!selectedRoomId || !selectedRoom || !selectedRoomIsAvailable) {
            setError('Please select a room that is available for your dates.');
            return;
        }

        if (guests > maxGuests) {
            setError(
                `This room can accommodate a maximum of ${maxGuests} guests.`
            );
            return;
        }

        if (!guestName.trim() || !guestEmail.trim() || !guestContact.trim()) {
            setError('Please complete all guest details.');
            return;
        }

        if (!checkIn || !checkOut || nights < 1) {
            setError('Please select valid booking dates.');
            return;
        }

        if (loadingBookedDates || bookedDatesError) {
            setError('The room calendar is not ready. Please try again.');
            return;
        }

        if (hasBookingOverlap(checkIn, checkOut)) {
            setError(
                'These dates are no longer available. Please choose different dates.'
            );
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post('/bookings', {
                room_id: Number(selectedRoomId),
                guest_name: guestName.trim(),
                guest_email: guestEmail.trim(),
                guest_contact_number: guestContact.trim(),
                check_in: checkIn,
                check_out: checkOut,
                guests: Number(guests),
            });

            setMessage(
                response.data.message ||
                'Your booking request has been submitted successfully.'
            );

            setCheckIn('');
            setCheckOut('');
            setGuests(1);
            setSelectedRoomId('');
            setRooms([]);
            setSelectedRoomDetails(null);
            setBookedPeriods([]);
            setSearched(false);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            if (validationErrors) {
                setError(
                    Object.values(validationErrors).flat().join(' ')
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    'Booking failed. Please try again.'
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Select another room from availability results.
    const handleSelectRoom = (room) => {
        setSelectedRoomId(String(room.id));
        setSelectedRoomDetails(room);

        const capacity = getRoomCapacity(room);

        setGuests((currentGuests) =>
            Math.min(Number(currentGuests) || 1, capacity)
        );

        setCheckIn('');
        setCheckOut('');
        setRooms([]);
        setSearched(false);
        setError('');
        setMessage('Room selected. Please choose your dates again.');
    };

    return (
        <div className="container py-5">

            <div className="text-center mb-5">
                <h1 className="fw-bold">Book Your Stay</h1>
                <p className="text-muted">
                    Choose your room and dates to check availability.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {message && (
                <div className="alert alert-info">{message}</div>
            )}

            {!selectedRoomId && (
                <div className="alert alert-warning text-center">
                    Please choose a room first to view its booking calendar.

                    <div className="mt-3">
                        <Link to="/rooms" className="btn btn-primary">
                            Explore Rooms
                        </Link>
                    </div>
                </div>
            )}

            {selectedRoomId && (
                <div className="row justify-content-center">
                    <div className="col-lg-9">

                        {/* SELECTED ROOM */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <h4 className="mb-3">
                                    1. Your Selected Room
                                </h4>

                                <p className="mb-2">
                                    Room reference: #{selectedRoomId}
                                </p>

                                {loadingRoom && (
                                    <p className="text-muted">
                                        Loading room details...
                                    </p>
                                )}

                                {selectedRoom && (
                                    <>
                                        <h5>
                                            {selectedRoom.name || selectedRoom.room_name}
                                        </h5>

                                        <p className="text-muted">
                                            {selectedRoom.description}
                                        </p>

                                        <div className="mb-2">
                                            <strong>
                                                Maximum guests:
                                            </strong>{' '}
                                            <span className="badge bg-success">
                                                {maxGuests} {maxGuests === 1 ? 'Guest' : 'Guests'}
                                            </span>
                                        </div>

                                        <p className="text-muted small">
                                            You can select up to {maxGuests} guests
                                            for this room.
                                        </p>

                                        <strong className="text-primary">
                                            LKR{' '}
                                            {Number(
                                                selectedRoom.price_per_night
                                            ).toLocaleString('en-LK')}
                                            {' '}/ night
                                        </strong>
                                    </>
                                )}

                                {loadingBookedDates && (
                                    <p className="text-muted mt-3 mb-0">
                                        Loading this room's booking calendar...
                                    </p>
                                )}

                                {bookedDatesError && (
                                    <div className="alert alert-danger mt-3 mb-0">
                                        {bookedDatesError}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DATE AND GUEST SELECTION */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <h4 className="mb-4">
                                    2. Select Your Dates
                                </h4>

                                <form onSubmit={searchAvailability}>
                                    <div className="row g-3">

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Check-in
                                            </label>

                                            <DatePicker
                                                selected={parseDate(checkIn)}
                                                onChange={(date) => {
                                                    const value = formatDate(date);

                                                    setCheckIn(value);
                                                    setCheckOut('');
                                                    setSearched(false);
                                                    setRooms([]);
                                                    setError('');
                                                    setMessage('');
                                                }}
                                                minDate={new Date()}
                                                filterDate={isCheckInDateAvailable}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Select check-in date"
                                                className="form-control"
                                                wrapperClassName="w-100"
                                                disabled={
                                                    loadingBookedDates ||
                                                    loadingRoom ||
                                                    Boolean(bookedDatesError)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Check-out
                                            </label>

                                            <DatePicker
                                                selected={parseDate(checkOut)}
                                                onChange={(date) => {
                                                    const value = formatDate(date);

                                                    if (value <= checkIn) {
                                                        setError(
                                                            'Check-out must be after check-in.'
                                                        );
                                                        return;
                                                    }

                                                    if (!isCheckOutDateAvailable(date)) {
                                                        setError(
                                                            'This checkout date overlaps an existing booking.'
                                                        );
                                                        return;
                                                    }

                                                    setCheckOut(value);
                                                    setSearched(false);
                                                    setRooms([]);
                                                    setError('');
                                                    setMessage('');
                                                }}
                                                minDate={
                                                    checkIn
                                                        ? getNextDay(checkIn)
                                                        : new Date()
                                                }
                                                filterDate={isCheckOutDateAvailable}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Select check-out date"
                                                className="form-control"
                                                wrapperClassName="w-100"
                                                disabled={
                                                    !checkIn ||
                                                    loadingBookedDates ||
                                                    loadingRoom ||
                                                    Boolean(bookedDatesError)
                                                }
                                                required
                                            />
                                        </div>

                                        {/* DYNAMIC GUEST SELECTOR */}
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Number of guests
                                            </label>

                                            <select
                                                className="form-select"
                                                value={guests}
                                                onChange={handleGuestChange}
                                                disabled={
                                                    loadingRoom ||
                                                    !selectedRoom
                                                }
                                                required
                                            >
                                                {Array.from(
                                                    { length: maxGuests },
                                                    (_, index) => index + 1
                                                ).map((number) => (
                                                    <option
                                                        key={number}
                                                        value={number}
                                                    >
                                                        {number}{' '}
                                                        {number === 1 ? 'Guest' : 'Guests'}
                                                    </option>
                                                ))}
                                            </select>

                                            <small className="text-muted">
                                                Maximum capacity: {maxGuests}{' '}
                                                {maxGuests === 1 ? 'guest' : 'guests'}
                                            </small>
                                        </div>

                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={
                                                    loading ||
                                                    loadingRoom ||
                                                    loadingBookedDates ||
                                                    Boolean(bookedDatesError)
                                                }
                                            >
                                                {loading
                                                    ? 'Checking...'
                                                    : 'Check Availability'}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <p className="text-muted small mt-3 mb-0">
                                    Dates occupied by pending or confirmed
                                    bookings are disabled in the calendar.
                                </p>
                            </div>
                        </div>

                        {/* AVAILABLE ROOMS */}
                        {searched && rooms.length > 0 && (
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-body p-4">
                                    <h4 className="mb-4">
                                        3. Available Rooms
                                    </h4>

                                    <div className="row g-3">
                                        {rooms.map((room) => {
                                            const roomCapacity = getRoomCapacity(room);

                                            return (
                                                <div
                                                    className="col-12"
                                                    key={room.id}
                                                >
                                                    <div
                                                        className={`card ${
                                                            String(selectedRoomId) ===
                                                            String(room.id)
                                                                ? 'border-primary border-2'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                                                <div>
                                                                    <h5>
                                                                        {room.name || room.room_name}
                                                                    </h5>

                                                                    <p className="text-muted mb-1">
                                                                        {room.description}
                                                                    </p>

                                                                    <p className="mb-1">
                                                                        Maximum guests:{' '}
                                                                        <strong>
                                                                            {roomCapacity}
                                                                        </strong>
                                                                    </p>

                                                                    <strong className="text-primary">
                                                                        LKR{' '}
                                                                        {Number(
                                                                            room.price_per_night
                                                                        ).toLocaleString('en-LK')}
                                                                        {' '}/ night
                                                                    </strong>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className={`btn ${
                                                                        String(selectedRoomId) ===
                                                                        String(room.id)
                                                                            ? 'btn-success'
                                                                            : 'btn-outline-primary'
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleSelectRoom(room)
                                                                    }
                                                                >
                                                                    {String(selectedRoomId) ===
                                                                    String(room.id)
                                                                        ? 'Selected'
                                                                        : 'Select Room'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BOOKING SUMMARY */}
                        {selectedRoom &&
                            searched &&
                            selectedRoomIsAvailable && (
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-body p-4">
                                        <h4 className="mb-3">
                                            4. Booking Summary
                                        </h4>

                                        <h5>
                                            {selectedRoom.name || selectedRoom.room_name}
                                        </h5>

                                        <p className="mb-1">
                                            Check-in: {checkIn}
                                        </p>

                                        <p className="mb-1">
                                            Check-out: {checkOut}
                                        </p>

                                        <p className="mb-1">
                                            Number of nights: {nights}
                                        </p>

                                        <p className="mb-1">
                                            Number of guests: {guests}
                                        </p>

                                        <p className="mb-1">
                                            Maximum room capacity: {maxGuests}
                                        </p>

                                        <hr />

                                        <h5 className="text-primary">
                                            Estimated total: LKR{' '}
                                            {totalPrice.toLocaleString('en-LK')}
                                        </h5>
                                    </div>
                                </div>
                            )}

                        {/* GUEST INFORMATION */}
                        {selectedRoom &&
                            searched &&
                            selectedRoomIsAvailable && (
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">
                                            5. Guest Information
                                        </h4>

                                        <form onSubmit={handleBooking}>
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Guest Name
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={guestName}
                                                    onChange={(event) =>
                                                        setGuestName(event.target.value)
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Email Address
                                                </label>

                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={guestEmail}
                                                    onChange={(event) =>
                                                        setGuestEmail(event.target.value)
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Contact Number
                                                </label>

                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={guestContact}
                                                    onChange={(event) =>
                                                        setGuestContact(event.target.value)
                                                    }
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100"
                                                disabled={
                                                    submitting ||
                                                    nights < 1 ||
                                                    loadingBookedDates ||
                                                    guests > maxGuests
                                                }
                                            >
                                                {submitting
                                                    ? 'Submitting...'
                                                    : 'Confirm Booking Request'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            )}

            <div className="text-center mt-4">
                <Link
                    to="/rooms"
                    className="btn btn-outline-secondary"
                >
                    Back to Rooms
                </Link>
            </div>
        </div>
    );
}

export default Booking;
