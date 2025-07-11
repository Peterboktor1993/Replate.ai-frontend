"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { handleRouteChange } from "@/middleware/restaurantMiddleware";
import { useDispatch } from "react-redux";

export default function RouterListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const restaurantId = searchParams.get("restaurant");

    const updateRestaurant = async () => {
      const fallbackId = restaurantId || "2";
      await handleRouteChange(fallbackId, dispatch);
    };

    updateRestaurant();
  }, [pathname, searchParams, dispatch]);

  return null;
}
