import React from "react";

const MobilePlaceOrderButton = ({ processing, calculateTotal }) => {
  return (
    <button
      type="submit"
      className="btn btn-primary d-block d-md-none w-100"
      disabled={processing}
    >
      {processing ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Processing...
        </>
      ) : (
        <>PLACE ORDER - ${calculateTotal().toFixed(2)}</>
      )}
    </button>
  );
};

export default MobilePlaceOrderButton;
