import Image from "next/image";
import { useState } from "react";

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

  const isValidSrc =
    typeof src === "string" &&
    src.trim() !== "" &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/"));
  const encodedSrc = isValidSrc ? encodeURI(src) : fallbackSrc;
  const finalSrc = imgError ? fallbackSrc : encodedSrc;

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
    <Image
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
