import Home from "@/components/home/Home";
import { getAllProductsServer } from "@/store/services/productService";
import { getAllCategoriesServer } from "@/store/services/categoriesService";
async function HomePage() {
  const { products, error: productsError } = await getAllProductsServer();
  const { categories, error: categoriesError } = await getAllCategoriesServer();

  return <Home initialProducts={products} initialCategories={categories} />;
}

export default HomePage;
