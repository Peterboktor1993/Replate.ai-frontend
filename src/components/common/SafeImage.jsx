import { useState } from "react";
import Image from "next/image";

const SafeImage = ({
  src,
  alt,
  className,
  width,
  height,
  style,
  fallbackSrc = "/images/placeholder.png",
}) => {
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    setImgError(true);
  };

  return (
    <Image
      src={imgError ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      style={{ width, height, ...style }}
      onError={handleError}
      priority={false}
      className={`${className}`}
    />
  );
};

export default SafeImage;
