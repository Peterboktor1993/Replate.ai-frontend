"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { handleRouteChange } from "@/middleware/restaurantMiddleware";
import { useDispatch } from "react-redux";
import { getAllProducts } from "@/store/services/productService";

export default function RouterListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const restaurantId = searchParams.get("restaurant");
    console.log(" URL param restaurant =", restaurantId);

    const updateRestaurant = async () => {
      const fallbackId = restaurantId || "2";
      console.log("✅ RouterListener is using restaurantId:", fallbackId);

      await handleRouteChange(fallbackId, dispatch);
      dispatch(getAllProducts({ restaurant_id: fallbackId }));
    };

    updateRestaurant();
  }, [pathname, searchParams, dispatch]);

  return null;
}
