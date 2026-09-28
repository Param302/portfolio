export default function HeroAccent({ children, className = "" }) {
  return (
    <span
      className={`px-6 font-accent text-5xl font-semibold italic leading-tight tracking-normal text-papaya-whip lg:text-7xl ${className}`}
      style={{ WebkitTextStroke: "5px #0B0F19", paintOrder: "stroke fill" }}
    >
      {children}
    </span>
  );
}
