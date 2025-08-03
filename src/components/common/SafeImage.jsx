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

  if (props.fill) {
    return (
      <div className={className} style={{ position: "relative", ...style }}>
        <img
          src={finalSrc}
          alt={alt}
          fill
          onError={handleError}
          style={{ objectFit: "cover", ...style }}
          {...props}
        />
      </div>
    );
  }

  if (!width || !height || (width && !height)) {
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
