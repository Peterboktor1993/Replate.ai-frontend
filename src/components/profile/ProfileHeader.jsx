import React from "react";
import Image from "next/image";
import { Button } from "react-bootstrap";

const ProfileHeader = ({
  profileData,
  previewImage,
  formData,
  handleFileChange,
  onRemoveImage,
}) => {
  return (
    <div className="profile-header text-center mb-4">
      <div className="profile-image-container position-relative d-inline-block mb-3">
        <div
          className="profile-image"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #f5f5f5",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Image
            src={
              previewImage ||
              profileData?.image_full_url ||
              "/assets/images/default-avatar.png"
            }
            alt="Profile"
            width={150}
            height={150}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        <label
          htmlFor="profile-image"
          className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center image-upload-overlay"
          style={{
            width: "40px",
            height: "40px",
            cursor: "pointer",
            right: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <i
            className="fas fa-camera text-white"
            style={{ fontSize: "18px" }}
          ></i>
        </label>
        <input
          type="file"
          id="profile-image"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <h4>
        {profileData?.f_name} {profileData?.l_name}
      </h4>
      <p className="text-muted">{profileData?.email}</p>
      <p className="text-muted">{profileData?.phone}</p>

      {formData.image && (
        <Button
          variant="outline-danger"
          size="sm"
          onClick={onRemoveImage}
          className="mt-2"
        >
          <i className="fas fa-times me-2"></i>
          Remove New Image
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;
