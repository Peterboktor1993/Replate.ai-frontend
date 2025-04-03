export const getFilteredCategories = (categories, products) => {
  const linkedCategoryIds = new Set();

  products.forEach((product) => {
    linkedCategoryIds.add(product.category_id.toString());
    product.category_ids.forEach((cat) => {
      linkedCategoryIds.add(cat.id);
    });
  });

  const result = [];
  categories.forEach((category) => {
    const isCategoryLinked = linkedCategoryIds.has(category.id.toString());
    const hasLinkedChild = category.childes.some((child) =>
      linkedCategoryIds.has(child.id.toString())
    );

    if (isCategoryLinked || hasLinkedChild) {
      const filteredCategory = { ...category };
      if (filteredCategory.childes.length > 0) {
        filteredCategory.childes = filteredCategory.childes.filter((child) =>
          linkedCategoryIds.has(child.id.toString())
        );
      }
      result.push(filteredCategory);
    }
  });

  return result;
};
