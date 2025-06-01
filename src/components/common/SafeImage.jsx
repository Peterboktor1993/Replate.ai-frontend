import { useState } from "react";
import Image from "next/image";

const SafeImage = ({
  src,
  alt = "Image",
  className,
  width,
  height,
  style,
  fallbackSrc = "/images/placeholder.png",
  ...props
}) => {
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    setImgError(true);
  };

  const isValidSrc = src && typeof src === "string" && src.trim() !== "";
  const finalSrc = imgError ? fallbackSrc : isValidSrc ? src : fallbackSrc;

  if (!finalSrc || typeof finalSrc !== "string" || finalSrc.trim() === "") {
    return null;
  }
  if (!width || !height) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        style={style}
        onError={handleError}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      style={style}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default SafeImage;
