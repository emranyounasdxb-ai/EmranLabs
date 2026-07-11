type PortfolioSectionHeadingProps = {
  eyebrow?: string;
  title: string;
  titleId?: string;
  description?: string;
};

export function PortfolioSectionHeading({
  eyebrow,
  title,
  titleId,
  description,
}: PortfolioSectionHeadingProps) {
  return (
    <div className="space-y-2">
      {eyebrow && (
        <p className="font-mono text-xs tracking-[0.24em] text-[var(--color-signal)] uppercase">
          {eyebrow}
        </p>
      )}
      <h3
        id={titleId}
        className="font-heading text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]"
      >
        {title}
      </h3>
      {description && (
        <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      )}
    </div>
  );
}
