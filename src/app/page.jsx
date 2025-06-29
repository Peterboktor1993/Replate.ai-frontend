import Home from "@/components/home/Home";
import { getAllCategoriesServer } from "@/store/services/categoriesService";
import { getAllProductsServer } from "@/store/services/productService";
import { getRestaurantDetailsServer } from "@/store/services/restaurantService";
import NotFoundRestaurantModal from "@/components/common/NotFoundRestaurantModal";

export default async function HomePage({ searchParams }) {
  const restaurantParam = (await searchParams)?.restaurant;

  if (!restaurantParam) {
    return (
      <>
        <NotFoundRestaurantModal />
      </>
    );
  }

  const restaurantId = restaurantParam;

  const restaurantData = await getRestaurantDetailsServer(restaurantId);

  if (!restaurantData) {
    return (
      <>
        <NotFoundRestaurantModal />
      </>
    );
  }

  const zoneId = restaurantData?.zone_id || 2;

  const [productsData, categoriesData] = await Promise.all([
    getAllProductsServer(restaurantId, 200, 0, zoneId),
    getAllCategoriesServer(),
  ]);

  const initialProducts = Array.isArray(productsData?.products)
    ? productsData.products
    : [];
  const productOffset = productsData?.offset;
  const productLimit = productsData?.limit;
  const productTotal = productsData?.total_size;
  const allCategories = Array.isArray(categoriesData?.categories)
    ? categoriesData.categories
    : [];

  const restaurantCategoryIds = restaurantData?.category_ids || [];
  const initialCategories = allCategories.filter((category) =>
    restaurantCategoryIds.includes(category.id)
  );

  return (
    <div>
      <Home
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        restaurantId={restaurantId}
        restaurantDetails={restaurantData}
        productOffset={productOffset}
        productLimit={productLimit}
        productTotal={productTotal}
      />
    </div>
  );
}
