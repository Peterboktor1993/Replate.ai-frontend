"use client";

const StarIcon = ({ filled }) => (
  <svg
    width="18"
    height="17"
    viewBox="0 0 18 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.10326 0.816986C8.47008 0.0737399 9.52992 0.07374 9.89674 0.816986L11.7063 4.48347C11.8519 4.77862 12.1335 4.98319 12.4592 5.03051L16.5054 5.61846C17.3256 5.73765 17.6531 6.74562 17.0596 7.32416L14.1318 10.1781C13.8961 10.4079 13.7885 10.7389 13.8442 11.0632L14.5353 15.0931C14.6754 15.91 13.818 16.533 13.0844 16.1473L9.46534 14.2446C9.17402 14.0915 8.82598 14.0915 8.53466 14.2446L4.91562 16.1473C4.18199 16.533 3.32456 15.91 3.46467 15.0931L4.15585 11.0632C4.21148 10.7389 4.10393 10.4079 3.86825 10.1781L0.940385 7.32416C0.346867 6.74562 0.674378 5.73765 1.4946 5.61846L5.54081 5.03051C5.86652 4.98319 6.14808 4.77862 6.29374 4.48347L8.10326 0.816986Z"
      fill={filled ? "#FC8019" : "#DBDBDB"}
    />
  </svg>
);

const StarRating = ({
  rating = 0,
  totalStars = 5,
  className = "",
  showRating = false,
}) => {
  let ratingValue = 0;

  if (typeof rating === "number") {
    ratingValue = rating;
  } else if (typeof rating === "string") {
    ratingValue = parseFloat(rating) || 0;
  }

  ratingValue = Math.max(0, Math.min(ratingValue, totalStars));

  return (
    <div className={`d-flex align-items-center ${className}`}>
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className="me-1">
          <StarIcon filled={index < ratingValue} />
        </span>
      ))}
    </div>
  );
};

export default StarRating;
