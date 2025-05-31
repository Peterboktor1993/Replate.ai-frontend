import React from "react";

const TipSection = ({
  tipPresets,
  tipPercentage,
  customTip,
  customTipAmount,
  handleTipSelection,
  enableCustomTip,
  handleCustomTipChange,
  calculateTip,
  disabled = false,
}) => {
  return (
    <div className={`tip-section mb-4 ${disabled ? "disabled" : ""}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="checkout-title font-bold">Add a Tip</span>
      </div>

      <div className="tip-presets mb-3">
        {tipPresets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`btn ${
              tipPercentage === preset.value && !customTip
                ? "btn-primary"
                : "btn-outline-primary"
            } btn-sm me-2 mb-2`}
            onClick={() => !disabled && handleTipSelection(preset.value)}
            disabled={disabled}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          className={`btn ${
            customTip ? "btn-primary" : "btn-outline-primary"
          } btn-sm mb-2`}
          onClick={() => !disabled && enableCustomTip()}
          disabled={disabled}
        >
          Custom
        </button>
      </div>

      {customTip && (
        <div className="input-group mb-3">
          <span className="input-group-text">USD</span>
          <input
            type="number"
            className="form-control"
            placeholder="Enter tip amount"
            value={customTipAmount}
            onChange={handleCustomTipChange}
            min="0"
            step="0.01"
            disabled={disabled}
          />
        </div>
      )}

      <div className="tip-range mb-3">
        <input
          type="range"
          className="form-range"
          min="0"
          max="35"
          step="5"
          value={customTip ? 0 : tipPercentage}
          onChange={(e) => {
            if (!disabled) {
              const value = parseInt(e.target.value);
              handleTipSelection(value);
            }
          }}
          disabled={customTip || disabled}
        />
        <div className="d-flex justify-content-between">
          <span>0%</span>
          <span>35%</span>
        </div>
      </div>

      {(tipPercentage > 0 || (customTip && customTipAmount > 0)) && (
        <div className="alert mb-0 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              {customTip ? <>Custom Tip</> : <>{tipPercentage}% Tip</>}
            </span>
            <span className="fw-bold">USD {calculateTip().toFixed(2)}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .tip-section.disabled {
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default TipSection;
