import MLPlayground from "@/app/components/ml-lab/MLPlayground";

export const metadata = {
  title: "404 | A little machine learning detour",
  description: "Page not found. Explore seven interactive machine-learning experiments, or head back to Parampreet's portfolio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <MLPlayground />
  );
}

