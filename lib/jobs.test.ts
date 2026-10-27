import { describe, expect, it } from "vitest";
import { computeStats, filterJobs, timeAgo, toCsv, type Job, type Status } from "./jobs";

function job(status: Status, overrides: Partial<Job> = {}): Job {
  return {
    id: Math.random().toString(36).slice(2),
    company: "Acme",
    role: "Developer",
    status,
    link: null,
    notes: null,
    created_at: "2026-10-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("computeStats", () => {
  it("returns zeros for an empty board", () => {
    expect(computeStats([])).toEqual({ total: 0, active: 0, interviews: 0, offers: 0, responseRate: 0 });
  });

  it("leaves wishlist items out of the response rate", () => {
    const jobs = [job("wishlist"), job("wishlist"), job("applied"), job("interview"), job("offer"), job("rejected")];
    const stats = computeStats(jobs);
    expect(stats.total).toBe(6);
    expect(stats.active).toBe(2); // applied + interview
    expect(stats.interviews).toBe(1);
    expect(stats.offers).toBe(1);
    expect(stats.responseRate).toBe(50); // 2 responses out of 4 sent
  });
});

describe("filterJobs", () => {
  const jobs = [
    job("applied", { company: "Northwind", role: "React Developer" }),
    job("applied", { company: "Cobalt", role: "Backend Engineer", notes: "Uses Supabase" }),
  ];

  it("returns everything for an empty query", () => {
    expect(filterJobs(jobs, "   ")).toHaveLength(2);
  });

  it("matches company, role and notes without caring about case", () => {
    expect(filterJobs(jobs, "northwind")).toHaveLength(1);
    expect(filterJobs(jobs, "ENGINEER")[0].company).toBe("Cobalt");
    expect(filterJobs(jobs, "supabase")[0].company).toBe("Cobalt");
  });
});

describe("toCsv", () => {
  it("quotes cells that contain commas, quotes or new lines", () => {
    const csv = toCsv([job("offer", { company: "Smith, Jones & Co", notes: 'Said "yes"\nstart Monday' })]);
    expect(csv.startsWith("Company,Role,Status,Link,Notes,Added\n")).toBe(true);
    expect(csv).toContain('"Smith, Jones & Co"');
    expect(csv).toContain('"Said ""yes""\nstart Monday"');
    expect(csv).toContain("2026-10-01");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-10-11T10:00:00.000Z");

  it("describes recent and older dates", () => {
    expect(timeAgo("2026-10-11T08:00:00.000Z", now)).toBe("today");
    expect(timeAgo("2026-10-10T09:00:00.000Z", now)).toBe("yesterday");
    expect(timeAgo("2026-10-01T10:00:00.000Z", now)).toBe("10 days ago");
    expect(timeAgo("2026-08-01T10:00:00.000Z", now)).toBe("2 months ago");
  });
});
