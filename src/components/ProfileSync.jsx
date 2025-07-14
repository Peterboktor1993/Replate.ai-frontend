import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "@/store/services/authService";

const ProfileSync = ({ details }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const restaurantId = details?.id;

  useEffect(() => {
    if (token && restaurantId) {
      dispatch(getUserProfile(token, restaurantId));
    }
  }, [token, restaurantId, dispatch]);

  return null;
};

export default ProfileSync;
