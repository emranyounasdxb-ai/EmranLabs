import { skillGroups } from "@/content/portfolio-content";

import { PortfolioSectionHeading } from "./portfolio-section-heading";

export function SkillsApp() {
  return (
    <section className="space-y-5">
      <PortfolioSectionHeading
        eyebrow="Capability map"
        title="Skills and delivery systems"
        description="A categorized view of technologies and product capabilities used across modern software, mobile, cloud, and automation work."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {skillGroups.map((group) => {
          const Icon = group.icon;
          return (
            <article
              key={group.id}
              className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-4"
            >
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[var(--glass-border)] bg-white/[0.055]">
                  <Icon
                    aria-hidden="true"
                    className="size-5 text-[var(--color-signal)]"
                  />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {group.description}
                  </p>
                </div>
              </div>
              <ul
                className="mt-4 flex flex-wrap gap-2"
                aria-label={`${group.title} skills`}
              >
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="rounded-full border border-[var(--glass-border)] bg-white/[0.035] px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
