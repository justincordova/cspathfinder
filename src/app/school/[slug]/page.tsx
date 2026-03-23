import { notFound } from "next/navigation";
import Link from "next/link";
import { loadSchoolsBySource, getSchoolBySlug } from "@/lib/data/loadSchools";
import { calculatePaybackYears } from "@/lib/data/filters";
import GradeBadge from "@/components/GradeBadge";
import SchoolLogo from "@/components/SchoolLogo";
import SchoolChatContext from "@/components/SchoolChatContext";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { Metadata } from "next";
import type { NicheGrades, NicheGradeType } from "@/lib/data/schema";

import HeartButton from "@/components/HeartButton";
import PageTransition from "@/components/PageTransition";
import { formatCurrency, formatPercent, GRADE_LABELS } from "@/utils/format";

export async function generateStaticParams() {
  const all = [...loadSchoolsBySource("csrankings"), ...loadSchoolsBySource("niche")];
  const unique = [...new Map(all.map((s) => [s.slug, s])).values()];
  return unique.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  return { title: school?.name ?? "Not Found" };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string" || slug.length > 200) {
    notFound();
  }

  const school = getSchoolBySlug(slug);
  if (!school) notFound();

  const totalCostInState = (school.tuitionInState + school.roomAndBoard) * 4;
  const totalCostOutOfState = (school.tuitionOutOfState + school.roomAndBoard) * 4;
  const rawPayback = calculatePaybackYears(school);
  const paybackYears = rawPayback !== null ? rawPayback.toFixed(1) : null;

  const financialStats: { label: string; value: string; color: string }[] = [
    {
      label: "In-State Tuition",
      value: formatCurrency(school.tuitionInState),
      color: "text-peach",
    },
    {
      label: "Out-of-State Tuition",
      value: formatCurrency(school.tuitionOutOfState),
      color: "text-peach",
    },
    { label: "Room & Board", value: formatCurrency(school.roomAndBoard), color: "text-text" },
    ...(totalCostInState > 0
      ? [
          {
            label: "4-Year Total (In-State)",
            value: formatCurrency(totalCostInState),
            color: "text-peach",
          },
        ]
      : []),
    ...(totalCostOutOfState > 0
      ? [
          {
            label: "4-Year Total (Out-of-State)",
            value: formatCurrency(totalCostOutOfState),
            color: "text-peach",
          },
        ]
      : []),
    {
      label: "Median Debt",
      value: school.medianDebt ? formatCurrency(school.medianDebt) : "—",
      color: "text-red",
    },
    {
      label: "Median Earnings (6yr)",
      value: school.medianEarnings6yr ? formatCurrency(school.medianEarnings6yr) : "—",
      color: "text-green",
    },
  ];

  const admissionStats: { label: string; value: string; color: string }[] = [
    {
      label: "CSRankings",
      value: school.csRanking ? `#${school.csRanking}` : "N/A",
      color: "text-primary",
    },
    {
      label: "Niche CS Rank",
      value: school.nicheRanking ? `#${school.nicheRanking}` : "N/A",
      color: "text-primary",
    },
    { label: "Acceptance Rate", value: formatPercent(school.acceptanceRate), color: "text-text" },
    { label: "Graduation Rate", value: formatPercent(school.graduationRate), color: "text-green" },
    { label: "Enrollment", value: school.enrollment.toLocaleString("en-US"), color: "text-text" },
  ];

  return (
    <PageTransition>
      <div id="main-content" className="py-12 space-y-10">
        <SchoolChatContext schoolName={school.name} />
        <div>
          <Link href="/" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Rankings
          </Link>
          <div className="flex items-center gap-4">
            <SchoolLogo website={school.website} name={school.name} size={64} />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{school.name}</h1>
                <HeartButton slug={school.slug} size="md" />
              </div>
              <p className="text-subtext0 text-lg">
                {school.city}, {school.state} · {school.region}
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4">Niche Grades</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
            {Object.entries(school.nicheGrades).map(([key, grade]) => {
              const gradeKey = key as keyof NicheGrades;
              const gradeValue = grade as NicheGradeType;
              return (
                <GradeBadge key={key} grade={gradeValue} label={GRADE_LABELS[gradeKey]} size="md" />
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Financials</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {financialStats.map((stat) => (
              <div key={stat.label} className="p-4 bg-mantle rounded-lg border border-surface0">
                <div className="text-sm text-subtext0 mb-1">{stat.label}</div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Rankings &amp; Admissions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {admissionStats.map((stat) => (
              <div key={stat.label} className="p-4 bg-mantle rounded-lg border border-surface0">
                <div className="text-sm text-subtext0 mb-1">{stat.label}</div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {paybackYears && (
          <section className="p-6 bg-mantle rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="text-sm text-subtext0 mb-2">
              Payback Period · 4-Year Cost of Attendance ÷ Median Earnings (6 years after
              enrollment)
            </div>
            <div className="text-4xl font-bold text-primary">
              {paybackYears}{" "}
              <span className="text-xl font-normal text-subtext0">years to break even</span>
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-4">
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            School Website
          </a>
          {school.nicheUrl && (
            <a
              href={school.nicheUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-surface0 text-text rounded-lg hover:bg-surface1 transition-colors text-sm font-medium"
            >
              Niche Profile
            </a>
          )}
          <CopyLinkButton />
        </div>
      </div>
    </PageTransition>
  );
}
