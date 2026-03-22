import promoBanner from "@/assets/promo-banner.jpg";

const PromoBanner = () => {
  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={promoBanner}
          alt="Special offers"
          className="h-40 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/80 font-body">
            Limited time
          </p>
          <h2 className="mt-1 text-2xl font-bold text-primary-foreground font-display">
            Free Delivery
          </h2>
          <p className="mt-0.5 text-sm text-primary-foreground/90 font-body">
            On your first 3 orders
          </p>
          <button className="mt-3 w-fit rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground font-body shadow-elevated">
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
