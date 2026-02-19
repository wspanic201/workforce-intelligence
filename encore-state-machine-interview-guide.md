# Encore State Machine Interview Guide
**How to use this:** Read each section header aloud to orient yourself, then answer the numbered questions in order. You don't have to answer in perfect sentences — stream of consciousness is fine. Cassidy will extract the structured data from whatever you say. If a question doesn't apply to CE at Kirkwood, just say "N/A" or "skip."

There are **5 state machines** to cover. Each one builds the foundation for the Encore data schema. Work through them in any order, but A5 (Section Lifecycle) is the shortest warmup if you want to start simple.

---

## HOW ANSWERS GET USED
Every answer maps to one of four things in a state machine:
- **STATE** — a stable condition something can be in (e.g., "waitlisted")
- **TRANSITION** — a move from one state to another (e.g., "waitlisted → enrolled")
- **TRIGGER** — what causes the transition (an action, event, time, or rule)
- **SIDE EFFECT** — what automatically happens when the transition fires (email sent, payment charged, record updated)

When answering, try to think in these terms. Example:
> "If a student on the waitlist gets a spot, they move to pending payment. The system emails them and gives them 48 hours to pay or they lose the seat."

That one sentence gives us: 2 states (waitlisted, pending payment), 1 trigger (spot opens up), 1 side effect (email), and 1 time-based rule (48 hours).

---

## FORMAT HINTS FOR DICTATION
- **Start each scenario with the trigger:** "When a student does X..."
- **Name the actors:** student, CE staff, instructor, system/automated, employer, financial aid
- **Flag exceptions explicitly:** "Unless it's a grant-funded enrollment, in which case..."
- **Call out Kirkwood-specific rules:** policies, thresholds, or quirks that might differ from other schools
- **Don't worry about completeness per question** — just talk through what you know; gaps will be flagged

---
---

# A5 — SECTION LIFECYCLE STATE MACHINE
*(Start here — shortest, cleanest warmup)*

A "section" is one scheduled offering of a course (e.g., Forklift Safety, June 10–12, 8am–5pm, Room 201). This machine tracks a section's status from creation to completion or cancellation.

---

### A5-Q1: How does a new section get created?
Who creates it — CE staff, department coordinator, someone else? Is it created in a system (Banner? spreadsheet? home-grown tool?), and what does "created" mean — is it immediately visible to students, or does it start in a draft/hidden state?

### A5-Q2: What happens before a section goes live for registration?
Walk me through the approval or publishing process. Is there a review step, a minimum enrollment threshold before it's "confirmed to run," or does it just go live when staff flips a switch?

### A5-Q3: When does registration close?
Is there a hard deadline (e.g., 3 days before start)? Does it close automatically when the section is full? Can staff override and add students after it "closes"?

### A5-Q4: What can happen to a section that kills it before it ever starts?
Walk me through: What does "cancelled" look like? What triggers a cancellation — is it always a staff action, or can it be automatic (e.g., minimum enrollment not met by a certain date)? What happens to enrolled students when a section is cancelled — are they auto-refunded, auto-moved to another section, or does staff handle it manually?

### A5-Q5: What does "postponed" look like vs. "cancelled"?
Does Kirkwood ever reschedule sections rather than cancel them outright? If so, how does that work — does it become a new section, or does the original section get new dates?

### A5-Q6: Once a section starts, what states can it be in?
Is there an "in progress" state? Can something happen mid-run that puts it in a special status (instructor out sick, facility problem, etc.)?

### A5-Q7: How does a section officially "complete"?
Is there a manual step (instructor submits grades/attendance), a date-based trigger (day after last class), or both? Who does it — instructor, CE staff, system?

### A5-Q8: Are there any other section-level statuses at Kirkwood I haven't asked about?
Anything that would require Encore to track a section differently than the states above?

---
---

# A2 — ENROLLMENT STATE MACHINE
*(The core flow — student's journey through a section)*

An "enrollment" is one student's registration record for one section. This machine tracks every status that enrollment can be in from the moment a student expresses interest through completion or departure.

---

### A2-Q1: Walk me through the normal happy path — no complications.
A student finds a course, clicks register, pays, shows up, finishes. What statuses does their enrollment record pass through? Don't overthink it — just narrate the journey.

### A2-Q2: What happens when a section is full?
Does Kirkwood maintain a waitlist? If yes:
- Is there a max waitlist size, or unlimited?
- When a spot opens, how does the waitlisted student get it — first-come-first-served automatically, or does staff choose?
- Is there a deadline for the waitlisted student to claim the spot?
- What if they don't respond in time?

### A2-Q3: Describe the employer-sponsored enrollment flow.
When a company is paying for an employee, how does that work end-to-end? Does the employer register the student, or does the student self-register and flag it as employer-sponsored? Is there a PO number or billing process? Does enrollment "hold" until the employer pays, or does it proceed and they're invoiced later?

### A2-Q4: What does withdrawal look like? Separate it by timing.
- Withdrawal **before** the course starts — what triggers it (student request? non-payment? staff action?), and is it always a full refund?
- Withdrawal **after** the course starts — same questions, but does it become a "drop" with different refund rules?
- Is there a point of no return after which they can't withdraw at all?

### A2-Q5: What about no-shows?
A student who registered and paid but never came to a single class — is that a "withdrawal" or something distinct? Do they get a refund? Does it affect their record any differently?

### A2-Q6: Can a student transfer between sections?
Example: they registered for the June session but need to move to the August session. How does that work — is it a cancellation + re-enrollment, or a transfer with no refund impact? Who can do it?

### A2-Q7: Walk me through an administrative override / comp enrollment.
Someone gets in for free — staff comp, grant-funded seat, scholarship. How is their enrollment record different? Is payment skipped entirely, or marked as "waived"? Who can authorize this?

### A2-Q8: Are there enrollment holds or conditional enrollments?
Any scenario where a student is "almost enrolled" but something has to happen first — prerequisites, approvals, orientation, program-specific intake — before they're fully confirmed?

### A2-Q9: What does "incomplete" mean in CE context?
For credit programs it's a grade; for CE it might mean they attended but couldn't finish. Does Kirkwood track this? If so, is there a deadline to resolve it and what happens if they don't?

### A2-Q10: Can a student be enrolled in the same section twice?
Example: they withdrew early, section didn't fill, they want back in. Or: they want to retake a course they already completed. How does Encore handle this — new enrollment record, or update the old one?

### A2-Q11: Any enrollment statuses or edge cases I haven't hit?
Anything CE-specific at Kirkwood (special populations, workforce grants, corporate partnerships) that creates unusual enrollment flows?

---
---

# A3 — PAYMENT STATE MACHINE
*(Money flows — how payments are created, collected, and reversed)*

A "payment" object tracks the financial obligation for one enrollment. This machine covers everything from "amount owed" through "paid in full" (or refunded, or written off).

---

### A3-Q1: What payment methods does Kirkwood CE accept today?
Check all that apply and describe how each works operationally:
- Online credit/debit card (self-service portal)
- Invoice / PO (employer or agency pays by check/ACH later)
- Cash or check at the counter
- Grant or scholarship (third party pays, student owes nothing)
- Payroll deduction (employee tuition benefit)
- Financial aid (Pell, WIOA, etc.)
- Other?

### A3-Q2: When is payment due relative to enrollment?
Is it "pay now to enroll" or "enroll now, pay by X date"? Is there a different rule for employer-sponsored vs. individual? Can a student be in a confirmed-enrolled state while still owing money?

### A3-Q3: Walk me through a failed payment.
Card declined online — what happens next? Does enrollment hold, cancel, or stay confirmed with a "payment failed" status? Are there retry attempts? Does the student get notified and given a window to fix it?

### A3-Q4: Does Kirkwood CE offer installment plans?
If yes:
- How many payments max? (Legal note: ≤4 payments over ≤90 days keeps you below TILA disclosure threshold)
- Is there a minimum course fee to qualify?
- What happens if an installment payment fails?
- Does a missed installment trigger enrollment cancellation, or just a collections process?

### A3-Q5: Describe the full refund policy — and where the lines are.
Walk me through refund eligibility by timing:
- Cancelled before course starts (student-initiated)
- Cancelled same day as first class
- During the first week
- After the first week / past the drop deadline
- Course is cancelled by the college (full refund always, right?)
- No-show

Are refunds ever partial? Is there an admin/processing fee that's non-refundable?

### A3-Q6: How does employer/invoice billing work end-to-end?
Student enrolls, employer gets invoiced — what does that process look like? Net 30? Who tracks whether the invoice was paid? What happens if the employer doesn't pay — does the student become responsible?

### A3-Q7: Have you ever had to write off a balance?
Student owes money, never pays, you eventually give up. Is there a status for that? Does it affect their ability to enroll in the future (a hold)?

### A3-Q8: How are refunds actually issued?
Back to original payment method? Check? Is there a refund approval process or can front-line staff do it?

### A3-Q9: Any payment scenarios at Kirkwood CE that are weird or unique?
Multi-payer situations (student pays half, employer pays half)? Voucher systems? Vendor-funded training where the company pays in advance?

---
---

# A4 — COMPLETION STATE MACHINE
*(How CE outcomes are tracked, calculated, and certified)*

A "completion record" is the outcome of one enrollment — attendance, CEUs earned, certificate status, transcript entry. This machine tracks the journey from "course in progress" to "outcome finalized."

---

### A4-Q1: How does Kirkwood CE track attendance?
- Who records it — instructor, CE staff, both?
- Is it per-session (daily sign-in sheet) or just overall (passed/failed threshold)?
- Is there a technology involved today (scanning, portal, paper)?
- What's the standard attendance threshold for CE — 80%? More? Does it vary by program type?

### A4-Q2: What's the CEU calculation rule?
The standard is 1 CEU = 10 contact hours. Does Kirkwood follow this exactly, or are there variations by program, accreditor, or licensing board? Are clock hours tracked separately from CEUs in some cases?

### A4-Q3: What triggers certificate issuance?
Is it purely attendance-based, or does the student also have to pass a test/assessment/skills check? Who decides — the instructor, CE staff, automated rule? Is certificate issuance manual or automatic?

### A4-Q4: Walk me through what happens when a student doesn't meet the attendance threshold.
Do they get partial CEUs, or zero? Do they get a "participated" or "audited" status instead of "completed"? Can an instructor grant an exception?

### A4-Q5: Are there programs where completion requires an external credential or test?
Examples: ServSafe, OSHA 10, CDL, real estate licensing — where the state or a third party issues the actual credential. How does Encore know the student passed their external exam? Does Kirkwood even track that, or just their coursework?

### A4-Q6: How does completion get onto a transcript?
For CE, "transcript" may be informal — does Kirkwood have an official CE transcript a student can request? Is it in Banner, a separate system, or emailed as a PDF? What gets recorded — CEUs, course name, date, grade (S/U?)?

### A4-Q7: Is there an "incomplete" state for CE completions?
If a student attended most of the course but missed the final session due to illness — do they get an incomplete that can be resolved later? What's the resolution window and what does resolution require?

### A4-Q8: What about competency-based programs?
Any CE programs where completion is tied to demonstrated skill rather than seat time? How is competency verified — instructor assessment, skills test, portfolio?

### A4-Q9: Are there any accreditor-specific completion rules?
Programs that report to nursing boards, contractor licensing bodies, workforce development agencies (WIOA) — do any of these have their own completion criteria or reporting requirements that differ from the standard CEU model?

### A4-Q10: What's the terminal state for a completion record?
Once it's finalized — certificate issued, transcript posted — can it ever be changed? What if a mistake was found? Is there an amendment or correction process?

---
---

# A1 — DATABASE SCHEMA NOTES
*(Not a full state machine — use this section to capture schema constraints that emerge from your answers above)*

These questions help catch data model decisions that aren't obvious from the state machines alone. Answer as things come to mind while working through A2–A5.

---

### A1-Q1: Multi-section enrollment
Can one student have multiple active enrollments simultaneously (two different courses running at the same time)? Any restrictions?

### A1-Q2: Sections with multiple instructors
Does Kirkwood ever co-teach CE sections? How are instructors attached to sections — one primary, multiple, or rotating?

### A1-Q3: Course vs. section vs. program relationships
Is there a hierarchy above "course"? Example: a certificate program made up of 4 required courses — does Kirkwood track progress toward that program, or just individual course completions?

### A1-Q4: Student identity across sessions
A student takes a course in 2024 and again in 2026. Are they the same record? Does CE have its own student ID system separate from credit students? Do CE-only students exist in Banner at all?

### A1-Q5: Section capacity and waitlist numbers
Are capacity limits set at the room level, the section level, or both? Is there a separate cap on waitlist size?

### A1-Q6: Historical data and record retention
How long does Kirkwood keep CE enrollment records? Is there a legal requirement (FERPA = generally 5 years after last enrollment)? Does Encore need to support archiving/purging of old records?

### A1-Q7: Custom fields per institution
When Encore goes multi-tenant, some colleges will need fields others don't (e.g., WIOA participant tracking, tribal grant reporting). How should Encore handle this — rigid schema with optional fields, or flexible attribute/value system?

---
---

# QUICK REFERENCE — WHAT CASSIDY NEEDS TO BUILD EACH MACHINE

| Machine | Key Output | What's Needed |
|---------|-----------|---------------|
| **A5 Section Lifecycle** | All section statuses + who/what moves sections between them | Q1–Q8 above |
| **A2 Enrollment** | All enrollment statuses + every transition trigger + side effects | Q1–Q11 above |
| **A3 Payment** | Payment methods, due timing, failure rules, refund policy | Q1–Q9 above |
| **A4 Completion** | Attendance tracking, CEU calc, cert triggers, transcript posting | Q1–Q10 above |
| **A1 Schema** | Data model constraints that don't live in any one state machine | Q1–Q7 above |

---

## WHAT HAPPENS AFTER YOU DICTATE

1. Cassidy reads your transcript
2. Extracts states, transitions, triggers, side effects from your answers
3. Builds formal state machine diagrams (Mermaid syntax)
4. Flags ambiguities or gaps for follow-up
5. Generates the schema doc (A1) once A2–A5 are solid
6. PDFs everything into the iCloud State Machines folder

You don't need to cover every question in one session. Finish one machine at a time — even partial answers are useful.

---

*Encore CE Platform — State Machine Interview Guide v1.0*
*Generated by Cassidy | February 2026*
