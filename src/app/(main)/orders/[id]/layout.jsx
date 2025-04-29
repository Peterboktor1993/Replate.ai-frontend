export async function generateMetadata({ params }) {
  return {
    title: `Order #${params.id} Details | Cravio`,
    description:
      "View the details of your order including items, pricing, and delivery information.",
  };
}

export default function OrderDetailLayout({ children }) {
  return <>{children}</>;
}
