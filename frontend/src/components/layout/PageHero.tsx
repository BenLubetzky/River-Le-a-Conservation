import type { ReactNode } from "react";

/** A page's banner: a photo under a dark wash, with the title and text in white over it. */
export default function PageHero({ image, kicker, title, children, actions, home = false }: {
  image: string;
  kicker?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** The taller banner of the home page. */
  home?: boolean;
}) {
  return (
    <section className={home ? "hero hero--home" : "hero"} style={{ backgroundImage: `url("${image}")` }}>
      <div className="hero-inner">
        {kicker && <span className="hero-kicker">{kicker}</span>}
        <h1 className="hero-title">{title}</h1>
        {children && <p className="hero-sub">{children}</p>}
        {actions && <div className="hero-actions">{actions}</div>}
      </div>
    </section>
  );
}
