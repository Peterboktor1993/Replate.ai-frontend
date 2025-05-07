import Home from "@/components/home/Home";
import { getAllCategoriesServer } from "@/store/services/categoriesService";
import { getAllProductsServer } from "@/store/services/productService";

export default async function HomePage({ searchParams }) {
  const restaurantId = (await searchParams)?.restaurant || "2";

  const [productsData, categoriesData] = await Promise.all([
    getAllProductsServer(restaurantId, 20, 1),
    getAllCategoriesServer(),
  ]);

  const initialProducts = Array.isArray(productsData?.products)
    ? productsData.products
    : [];
  const initialCategories = Array.isArray(categoriesData?.categories)
    ? categoriesData.categories
    : [];

  return (
    <div>
      <Home
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        restaurantId={restaurantId}
      />
    </div>
  );
}
