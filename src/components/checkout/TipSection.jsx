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
  const handleCustomTipInput = (e) => {
    const value = e.target.value;

    if (value === "") {
      handleCustomTipChange({ target: { value: "" } });
      return;
    }

    if (value === ".") {
      handleCustomTipChange({ target: { value: value } });
      return;
    }

    const floatRegex = /^(\d*\.?\d{0,2}|\.\d{0,2})$/;

    if (!floatRegex.test(value)) {
      return;
    }

    if ((value.match(/\./g) || []).length > 1) {
      return;
    }

    handleCustomTipChange({ target: { value: value } });
  };

  const handleTipPresetClick = (presetValue) => {
    if (disabled) return;
    handleTipSelection(presetValue);
  };

  const handleCustomTipClick = () => {
    if (disabled) return;
    enableCustomTip();
  };

  const displayTipAmount = () => {
    if (customTip) {
      return customTipAmount > 0
        ? `$${Number(customTipAmount).toFixed(2)}`
        : "$0.00";
    } else if (tipPercentage > 0) {
      return `$${calculateTip().toFixed(2)}`;
    }
    return "$0.00";
  };

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
            onClick={() => handleTipPresetClick(preset.value)}
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
          onClick={handleCustomTipClick}
          disabled={disabled}
        >
          Custom
        </button>
      </div>

      {customTip && (
        <div className="input-group mb-3">
          <span className="input-group-text">$</span>
          <input
            type="text"
            className="form-control"
            placeholder="2.50"
            value={customTipAmount}
            onChange={handleCustomTipInput}
            min="0"
            step="0.01"
            disabled={disabled}
            title="Enter tip amount (e.g., 2.50, 5.75, 10.25)"
            inputMode="decimal"
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
        <div className="alert alert-light border mb-0 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              {customTip ? <>Custom Tip</> : <>{tipPercentage}% Tip</>}
            </span>
            <span className="fw-bold text-primary">{displayTipAmount()}</span>
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
