"use client";

import React, { useState, useEffect } from "react";
import tzLookup from "tz-lookup";

export const getCurrentRestaurantId = (state) => {
  return state?.restaurant?.currentRestaurant?.id;
};

export const getLinkWithRestaurant = (path, restaurantId) => {
  if (restaurantId) {
    return `${path}?restaurant=${restaurantId}`;
  }
  return path;
};

export const updateRestaurantInUrl = (newRestaurantId) => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("restaurant", newRestaurantId);
    window.history.replaceState({}, "", url.toString());
  }
};

export const getRestaurantStatus = (restaurant) => {
  if (!restaurant) {
    return {
      isOpen: false,
      status: "Closed",
      message: "Restaurant information not available",
      statusClass: "text-danger",
    };
  }

  const isActiveFlag = !(
    restaurant?.active === false ||
    restaurant?.active === "false" ||
    restaurant?.active === 0 ||
    restaurant?.active === "0"
  );

  if (!isActiveFlag) {
    const nextOpenInfo = getNextOpeningTime(
      restaurant.schedules || [],
      new Date()
    );
    return {
      isOpen: false,
      status: "Closed",
      message: "Restaurant is temporarily closed",
      statusClass: "text-danger",
      nextOpenTime: nextOpenInfo.nextOpenTime,
    };
  }

  const now = getNowInRestaurantTz(restaurant);
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const schedules = restaurant.schedules || [];

  const todaySchedule = schedules.find(
    (schedule) => schedule.day === currentDay
  );

  if (!todaySchedule) {
    return {
      isOpen: false,
      status: "Closed",
      message: "Restaurant is closed today",
      statusClass: "text-danger",
    };
  }

  const openingTime = parseTimeToMinutes(todaySchedule.opening_time);
  const closingTime = parseTimeToMinutes(todaySchedule.closing_time);

  let isCurrentlyOpen = false;

  if (closingTime > openingTime) {
    isCurrentlyOpen = currentTime >= openingTime && currentTime < closingTime;
  } else if (closingTime < openingTime) {
    isCurrentlyOpen = currentTime >= openingTime || currentTime < closingTime;
  } else {
    isCurrentlyOpen = true;
  }

  if (isCurrentlyOpen) {
    const closingTimeFormatted = formatTime(todaySchedule.closing_time);
    return {
      isOpen: true,
      status: "Open",
      message: `Open until ${closingTimeFormatted}`,
      statusClass: "text-success",
    };
  }

  const nextOpenInfo = getNextOpeningTime(schedules, now);

  return {
    isOpen: false,
    status: "Closed",
    message: nextOpenInfo.message,
    statusClass: "text-danger",
    nextOpenTime: nextOpenInfo.nextOpenTime,
  };
};

const parseTimeToMinutes = (timeString) => {
  if (!timeString) return 0;

  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (timeString) => {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const getNextOpeningTime = (schedules, currentDate) => {
  const currentDay = currentDate.getDay();
  const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();

  const todaySchedule = schedules.find(
    (schedule) => schedule.day === currentDay
  );
  if (todaySchedule) {
    const openingTime = parseTimeToMinutes(todaySchedule.opening_time);
    if (currentTime < openingTime) {
      const openingTimeFormatted = formatTime(todaySchedule.opening_time);
      return {
        message: `Opens today at ${openingTimeFormatted}`,
        nextOpenTime: openingTimeFormatted,
      };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextSchedule = schedules.find((schedule) => schedule.day === nextDay);

    if (nextSchedule) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = i === 1 ? "tomorrow" : dayNames[nextDay];
      const openingTimeFormatted = formatTime(nextSchedule.opening_time);

      return {
        message: `Opens ${dayName} at ${openingTimeFormatted}`,
        nextOpenTime: openingTimeFormatted,
      };
    }
  }

  return {
    message: "Opening hours not available",
    nextOpenTime: null,
  };
};

const getNowInRestaurantTz = (restaurant) => {
  try {
    if (restaurant?.latitude && restaurant?.longitude) {
      const lat = parseFloat(restaurant.latitude);
      const lon = parseFloat(restaurant.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        const tz = tzLookup(lat, lon);
        const nowStr = new Date().toLocaleString("en-US", { timeZone: tz });
        return new Date(nowStr);
      }
    }
  } catch (err) {
    // fallback
  }
  return new Date();
};

export const useRestaurantStatus = (restaurant) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (restaurant) {
      const updateStatus = () => {
        const currentStatus = getRestaurantStatus(restaurant);
        setStatus(currentStatus);
      };

      updateStatus();
      const interval = setInterval(updateStatus, 60000);

      return () => clearInterval(interval);
    }
  }, [restaurant]);

  return status;
};
