
import { useEffect, useState } from 'react';
import api from '../services/api';

function BookingReview({ booking }) {
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState(0);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const today = new Date().toISOString().slice(0, 10);
    const checkOut = String(booking.check_out).slice(0, 10);

    const eligible =
        booking.status === 'confirmed' && checkOut <= today;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get(
                    `/rooms/${booking.room_id}/reviews`
                );

                setReviews(response.data.reviews || []);
                setAverage(response.data.average_rating || 0);

                if (
                    response.data.reviews?.some(
                        review => Number(review.booking_id) === Number(booking.id)
                    )
                ) {
                    setSubmitted(true);
                }
            } catch {
                setError('Unable to load reviews.');
            }
        };

        fetchReviews();
    }, [booking.id, booking.room_id]);

    const submitReview = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await api.post('/reviews', {
                booking_id: booking.id,
                rating,
                comment,
            });

            setMessage(response.data.message);
            setSubmitted(true);
            setComment('');

            const updated = await api.get(
                `/rooms/${booking.room_id}/reviews`
            );

            setReviews(updated.data.reviews || []);
            setAverage(updated.data.average_rating || 0);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                Object.values(err.response?.data?.errors || {})
                    .flat()
                    .join(' ') ||
                'Unable to submit your review.'
            );
        }
    };

    return (
        <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
                <h6 className="fw-bold">Guest Reviews</h6>

                <p className="mb-2">
                    <span className="text-warning">★</span>
                    <strong> {average}/5</strong>
                    <span className="text-muted small">
                        {' '}({reviews.length} reviews)
                    </span>
                </p>

                {eligible && !submitted && (
                    <form onSubmit={submitReview}>
                        <label className="form-label fw-semibold">
                            Your rating
                        </label>

                        <div className="mb-3">
                            {[1, 2, 3, 4, 5].map(number => (
                                <button
                                    key={number}
                                    type="button"
                                    className="btn btn-link p-1 fs-4 text-decoration-none"
                                    style={{
                                        color: number <= rating ? '#f5b301' : '#ccc'
                                    }}
                                    onClick={() => setRating(number)}
                                    aria-label={`${number} stars`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="form-control mb-3"
                            rows="3"
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={event => setComment(event.target.value)}
                            minLength="5"
                            maxLength="1000"
                            required
                        />

                        <button className="btn btn-primary btn-sm" type="submit">
                            Submit Review
                        </button>
                    </form>
                )}

                {submitted && (
                    <p className="text-success small">
                        You have already reviewed this booking.
                    </p>
                )}

                {!eligible && !submitted && (
                    <p className="text-muted small">
                        You can review this room after completing your confirmed stay.
                    </p>
                )}

                {message && (
                    <div className="alert alert-success mt-2">{message}</div>
                )}

                {error && (
                    <div className="alert alert-danger mt-2">{error}</div>
                )}

                <hr />

                {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="mb-3">
                        <strong>{review.user?.name || 'Guest'}</strong>
                        <div className="text-warning">
                            {'★'.repeat(review.rating)}
                            <span className="text-muted">
                                {'☆'.repeat(5 - review.rating)}
                            </span>
                        </div>
                        <p className="text-muted small mb-0">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookingReview;
