# HelpRoster --- UI/UX Design Specification

> **Project:** HelpRoster --- Volunteer Opportunity Platform\
> **Document:** `Design.md`\
> **Version:** 1.0\
> **Status:** Initial design specification\
> **Frontend:** React + JavaScript\
> **Backend:** Node.js + Express.js\
> **Database:** MySQL

------------------------------------------------------------------------

## 1. 🎨 Design Vision

HelpRoster should feel welcoming, trustworthy, accessible, and easy to
use. The interface should help volunteers find meaningful opportunities
quickly and help organizations manage applications without unnecessary
complexity.

The visual direction is a clean SaaS website with a light background,
one primary accent color, readable sans-serif typography, rounded cards,
subtle shadows, and a consistent header and footer.

### Design principles

1.  **Clarity first:** Make the purpose of each page and the next action
    obvious.
2.  **Trust:** Clearly display organization identity, opportunity
    details, and application status.
3.  **Consistency:** Reuse shared components and design tokens across
    pages.
4.  **Accessibility:** Support keyboard navigation, visible focus, clear
    labels, and sufficient contrast.
5.  **Responsive design:** Work well on mobile, tablet, and desktop.
6.  **Useful feedback:** Provide loading, empty, success, validation,
    and error states.
7.  **Privacy by default:** Never show private application or profile
    information publicly.

## 2. 👥 User Types and Design Needs

  -----------------------------------------------------------------------
  User type                           Main design needs
  ----------------------------------- -----------------------------------
  Public visitor                      Understand HelpRoster, explore
                                      opportunities, find organizations,
                                      register

  Volunteer                           Discover opportunities, apply,
                                      track decisions, record hours, view
                                      achievements

  Organization representative         Publish opportunities, review
                                      applicants, manage participation

  Administrator                       Review accounts and content,
                                      moderate listings, inspect audit
                                      history
  -----------------------------------------------------------------------

Navigation and actions should adapt to the signed-in user's role. The
backend remains responsible for enforcing permissions; UI visibility is
not a security control.

## 3. 🧭 Sitemap and Navigation

``` text
HelpRoster
├── Home
├── Opportunities
│   ├── Opportunity List
│   ├── Opportunity Details
│   └── Categories
├── Organizations
│   ├── Organization List
│   └── Organization Profile
├── About
│   ├── About Us
│   ├── How It Works
│   └── Team
├── Contact
│   ├── Contact Form
│   ├── Support
│   └── FAQ
├── Authentication
│   ├── Register
│   ├── Login
│   └── Password Reset
├── Volunteer Workspace
│   ├── Dashboard
│   ├── My Applications
│   ├── Volunteer Hours
│   └── Achievements
├── Organization Workspace
│   ├── Dashboard
│   ├── Organization Profile
│   ├── My Opportunities
│   ├── Create / Edit Opportunity
│   ├── Applicants
│   └── Volunteer Hours Review
└── Admin Workspace
    ├── Overview
    ├── Users
    ├── Organizations
    ├── Opportunities
    └── Moderation / Audit History
```

### 3.1 Global Header

**Desktop** - HelpRoster logo and wordmark on the left. - Primary
navigation: Home, Opportunities, Organizations, About. - Search entry
point. - Contact link or secondary navigation. - Right side: Log In and
Sign Up for visitors; profile menu for signed-in users.

**Mobile** - Compact logo and menu toggle. - Navigation displayed in an
accessible drawer or menu. - Search available without obscuring page
content. - Account actions remain easy to locate.

### 3.2 Global Footer

Include: - HelpRoster name and short mission statement. - Links to
Opportunities, Organizations, About, Contact, and FAQ. - Privacy Policy
and Terms links when those pages are published. - Social media links
only when official accounts are configured. - Copyright notice.

Use the same header and footer patterns throughout public pages.
Authenticated workspaces may use a simplified workspace navigation while
preserving brand consistency.

## 4. 🎨 Design Tokens

Use CSS variables or the equivalent styling-system tokens. The following
palette is a proposal and should be validated for contrast before
release.

### 4.1 Color Palette

  -------------------------------------------------------------------------
  Token                     Suggested value         Usage
  ------------------------- ----------------------- -----------------------
  `--color-primary`         `#2563EB`               Primary buttons, links,
                                                    active navigation

  `--color-primary-hover`   `#1D4ED8`               Hover and active
                                                    primary actions

  `--color-accent`          `#14B8A6`               Selected highlights and
                                                    impact accents

  `--color-bg`              `#F8FAFC`               Main page background

  `--color-surface`         `#FFFFFF`               Cards, menus, form
                                                    surfaces

  `--color-text`            `#0F172A`               Main text

  `--color-text-muted`      `#475569`               Secondary text

  `--color-border`          `#E2E8F0`               Borders and dividers

  `--color-success`         `#15803D`               Success feedback

  `--color-warning`         `#B45309`               Warnings and pending
                                                    states

  `--color-danger`          `#B91C1C`               Errors and destructive
                                                    actions
  -------------------------------------------------------------------------

Do not rely on color alone to communicate status. Pair colors with text
and, where helpful, icons.

### 4.2 Typography

Recommended stack:

``` css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

  Token             Suggested size Usage
  --------------- ---------------- ---------------------------------
  `--text-xs`                 12px Small metadata
  `--text-sm`                 14px Supporting text, labels
  `--text-base`               16px Body text
  `--text-lg`                 18px Introductory text
  `--text-xl`                 20px Card titles
  `--text-2xl`                24px Section headings
  `--text-3xl`                30px Page headings
  `--text-4xl`                36px Hero headings on larger screens

Use a clear heading hierarchy and comfortable line height. Avoid small,
low-contrast body text.

### 4.3 Spacing, Radius, and Shadows

  Token             Suggested value   Usage
  ----------------- ----------------- ----------------------------
  `--space-1`       4px               Tight icon/text spacing
  `--space-2`       8px               Small gaps
  `--space-3`       12px              Compact component spacing
  `--space-4`       16px              Standard component spacing
  `--space-6`       24px              Card and section spacing
  `--space-8`       32px              Large section spacing
  `--radius-sm`     6px               Small controls
  `--radius-md`     12px              Cards and inputs
  `--radius-lg`     18px              Feature cards
  `--radius-pill`   999px             Pills and compact badges

Use subtle shadows sparingly. Prefer spacing and borders over heavy
elevation effects.

## 5. 🧱 Shared UI Components

  -----------------------------------------------------------------------
  Component               Purpose                 Key states
  ----------------------- ----------------------- -----------------------
  `SiteHeader`            Public navigation and   Default, mobile menu
                          account actions         open, signed in

  `SiteFooter`            Consistent footer links Default

  `PageContainer`         Standard content width  Responsive
                          and padding             

  `PageHeading`           Page title,             Default
                          description, optional   
                          action                  

  `Button`                Primary and secondary   Default, hover, focus,
                          actions                 disabled, loading

  `TextField`             Single-line input       Default, focus, error,
                                                  disabled

  `TextArea`              Long-form text          Default, focus, error

  `SelectField`           Selectable options      Default, focus, error

  `SearchBar`             Keyword search          Empty, filled, loading

  `FilterPanel`           Category, location,     Applied, cleared,
                          date, skill filters     mobile drawer

  `OpportunityCard`       Opportunity summary     Default, saved if
                                                  feature exists

  `OrganizationCard`      Organization summary    Default

  `StatusBadge`           Application or review   Pending, accepted,
                          status                  rejected, closed

  `EmptyState`            Explains missing        No results, no
                          content and next step   applications

  `ErrorState`            Explains a failed       Retry where appropriate
                          operation and recovery  

  `LoadingSkeleton`       Indicates content       Loading
                          loading                 

  `ConfirmDialog`         Confirms destructive or Open, cancel, confirm
                          consequential actions   

  `Pagination`            Navigates long lists    Previous/next, current
                                                  page

  `Toast` / `Alert`       Short feedback          Success, warning, error

  `Modal` / `Drawer`      Focused interaction or  Open, close
                          mobile navigation       

  `MetricCard`            Dashboard summary       Default, loading,
                                                  unavailable
  -----------------------------------------------------------------------

All interactive components should have keyboard support, visible focus
indicators, meaningful accessible names, and appropriate disabled
states.

## 6. 🏠 Page Design Specifications

### 6.1 Home Page

**Goal:** Explain the platform and help visitors discover opportunities
or register.

**Suggested layout** 1. Shared header. 2. Hero section with a
mission-focused headline, brief supporting text, primary CTA "Explore
Opportunities," and secondary CTA "Join as a Volunteer." 3. Search entry
point for opportunities. 4. Featured opportunities displayed as cards.
5. Impact section with verified aggregate metrics, such as approved
volunteer hours and active opportunities, when reliable data exists. 6.
"How It Works" section for volunteers and organizations. 7.
Organization/community highlights, if available. 8. CTA encouraging
organizations to publish opportunities. 9. Shared footer.

**Behavior** - "Explore Opportunities" opens the listing page. - "Join
as a Volunteer" opens registration with the volunteer role selected
where supported. - Impact metrics must come from valid data, not
invented sample claims in production. - Show a useful fallback when
featured opportunities are unavailable.

### 6.2 Opportunities List Page

**Goal:** Help users find a suitable volunteering activity.

**Suggested layout** - Page heading and brief introduction. - Search
bar. - Filter controls for category, location, date, and skills. -
Result count and sort control if sorting is implemented. - Opportunity
cards in a responsive grid. - Pagination or a "Load more" pattern. -
Empty state with a clear "Clear filters" action.

**Opportunity card content** - Opportunity title. - Organization name
and logo, if configured. - Category. - Location or "Remote." - Date/time
or time commitment. - Short description. - Application deadline where
applicable. - Primary action: "View Details."

Avoid showing a prominent "Apply" action if the listing is closed or the
deadline has passed.

### 6.3 Opportunity Details Page

**Goal:** Give volunteers enough information to make an informed
decision.

**Suggested sections** - Breadcrumbs. - Opportunity title and status. -
Organization identity and profile link. - Description and goals. -
Responsibilities and activities. - Required skills and eligibility. -
Location, date, schedule, and time commitment. - Application deadline
and capacity, if used. - Accessibility or safety information supplied by
the organization. - Application CTA and relevant sign-in prompt. -
Related opportunities, if available.

**Behavior** - Open opportunities show an application action to eligible
signed-in volunteers. - Visitors are directed to sign in or register
before applying. - Closed, expired, or unavailable opportunities show a
clear status and disable submission. - The backend remains authoritative
about eligibility and availability.

### 6.4 Organizations List Page

**Goal:** Help users discover organizations and understand their work.

**Suggested layout** - Page heading and optional search. - Organization
cards with logo, name, mission, location, and selected public details. -
Optional category or location filters. - Pagination and empty states.

Only show verification badges when the platform has actually completed
the relevant review.

### 6.5 Organization Profile Page

Include: - Organization name, logo, and approved/public status. -
Mission and description. - Public contact or website information, where
explicitly provided. - Location. - Current published opportunities. -
Clear links to opportunity detail pages.

Do not expose private account details or internal moderation notes.

### 6.6 Applications Page

**Goal:** Help volunteers understand the progress of their applications.

**Suggested layout** - Page heading. - Summary counts by status. -
Filter tabs: All, Pending, Accepted, Rejected, Withdrawn. - Application
list with opportunity title, organization, submission date, current
status, and a detail link. - Empty state with an opportunity-discovery
CTA.

**Behavior** - Status labels must use text and not color alone. -
Display the latest status and relevant timestamps. - Only the signed-in
volunteer's application records are returned by the API.

### 6.7 Volunteer Dashboard

**Goal:** Summarize a volunteer's activity and next actions.

**Suggested sections** - Welcome message. - Metric cards: total
applications, accepted applications, approved hours, achievements. -
Upcoming accepted activities, if scheduling data is supported. - Recent
application updates. - Volunteer-hour records with review status. -
Earned badges and achievement progress. - Shortcuts to browse
opportunities and view application history.

Use approved hour records for official impact totals. Label pending
submissions separately.

### 6.8 Organization Dashboard

**Goal:** Help organizations coordinate opportunities and applicants.

**Suggested sections** - Organization identity and profile completion. -
Summary metrics: active opportunities, new applications, decisions
pending, approved participation hours. - Opportunity management
table/list with draft, published, closed, and archived statuses. -
Recent applications. - Quick actions: Create Opportunity, Review
Applicants, Edit Profile. - Volunteer-hour review queue when the feature
is enabled.

Show only data belonging to the organization the signed-in
representative is authorized to manage.

### 6.9 Create / Edit Opportunity

Use a clear form grouped into sections:

1.  **Basics:** title, category, short summary.
2.  **Description:** mission, responsibilities, expected outcome.
3.  **Requirements:** skills, eligibility, age requirements if
    applicable and legally appropriate.
4.  **Logistics:** location/remote option, dates, time commitment,
    capacity if supported.
5.  **Application:** deadline and any application questions.
6.  **Review:** preview, save draft, publish.

Requirements: - Mark required fields clearly. - Show inline validation
messages. - Preserve entered data after recoverable validation errors. -
Warn before leaving with unsaved changes when feasible. - Confirm
publish/close/archive actions where consequential. - Revalidate all
fields on the server.

### 6.10 About Page

Include: - Mission and purpose. - How the platform works for volunteers
and organizations. - Principles of responsible volunteering. - Team or
organization information only when confirmed. - CTA to explore
opportunities or register an organization.

### 6.11 Contact and FAQ Page

Include: - Contact form with name, email, subject, and message. - Clear
required-field indicators and inline validation. - Confirmation after
successful submission. - FAQ grouped by volunteers, organizations,
accounts, and platform support. - Alternative support information only
when configured.

Protect the form against spam and do not reveal internal server errors.

### 6.12 Authentication Pages

**Registration** - Account type selection: Volunteer or Organization. -
Name, email, password, and confirmation if desired. - Organization
registration may collect organization name and additional review
information. - Terms and privacy acknowledgement where legally required.

**Login** - Email and password. - Password visibility toggle. - Link to
password reset. - Safe error message for invalid credentials.

**Password reset** - Request reset link. - Confirmation message that
does not unnecessarily reveal whether an email is registered. -
Time-limited reset flow when email delivery is configured.

### 6.13 Admin Workspace

Include: - Overview of platform activity. - User and organization
lists. - Organization review queue. - Opportunity moderation queue. -
Account status controls. - Audit history for privileged actions.

Admin actions should require explicit confirmation where destructive,
record an audit event, and display only the minimum necessary personal
data.

## 7. 📱 Responsive Design

### Breakpoint guidance

Use content-driven breakpoints rather than assuming a device is always a
specific width.

  -----------------------------------------------------------------------
  Range                               Layout guidance
  ----------------------------------- -----------------------------------
  Small mobile: under 640px           Single-column cards, compact
                                      header, stacked forms, mobile
                                      filters

  Tablet: 640--1023px                 Two-column cards where space
                                      permits, collapsible secondary
                                      navigation

  Desktop: 1024px and above           Full navigation, multi-column
                                      cards, expanded dashboard layout
  -----------------------------------------------------------------------

These are initial design breakpoints and may be adjusted during
implementation.

### Responsive requirements

-   No unintended horizontal overflow.
-   Forms remain readable and usable on narrow screens.
-   Tables transform into compact lists or deliberate horizontal
    scrolling.
-   Dialogs and drawers fit the viewport.
-   Touch targets have sufficient size and spacing.
-   Focus order remains logical when navigation changes.

## 8. ♿ Accessibility Requirements

Aim for WCAG 2.2 AA practices.

-   Semantic HTML landmarks and headings.
-   Labels associated with all form controls.
-   Keyboard access for menus, dialogs, filters, and controls.
-   Visible focus states.
-   Sufficient text and control contrast.
-   Status conveyed through text, not color alone.
-   Useful alternative text for meaningful images.
-   Error messages associated with their inputs.
-   Focus moved appropriately into dialogs and restored when they close.
-   Respect reduced-motion preferences.
-   Accessible loading announcements where needed.
-   Avoid auto-playing media and unnecessary motion.

Automated checks should be supplemented by keyboard and screen-reader
testing.

## 9. 🔄 Interaction and State Patterns

### 9.1 Loading

-   Use skeletons for card and dashboard content when appropriate.
-   Disable repeated submissions while a request is in progress.
-   Preserve the user's entered data when safe to do so.

### 9.2 Empty States

Every empty state should explain why there is no content and offer a
relevant next action. Examples: - No opportunities match the filters →
"Clear filters." - No applications yet → "Explore opportunities." - No
organization opportunities → "Create an opportunity." - No earned badges
→ explain how achievements are earned.

### 9.3 Error States

-   Use concise, actionable language.
-   Keep technical details out of user-facing messages.
-   Offer retry when appropriate.
-   Avoid silently discarding form values.
-   Provide field-level validation where possible.

### 9.4 Confirmation

Use confirmations for important actions such as publishing, closing,
archiving, or moderating content. Avoid unnecessary confirmation dialogs
for ordinary navigation.

## 10. 🏷️ Status and Badge Design

Suggested application statuses:

  Status        Display label   Meaning
  ------------- --------------- ------------------------------
  `pending`     Pending         Awaiting organization review
  `accepted`    Accepted        Application accepted
  `rejected`    Not selected    Application declined
  `withdrawn`   Withdrawn       Volunteer withdrew

Suggested opportunity statuses:

  Status        Display label   Meaning
  ------------- --------------- --------------------------------------
  `draft`       Draft           Not publicly visible
  `published`   Open            Available according to listing rules
  `closed`      Closed          No new applications
  `archived`    Archived        Retained for history, not active

The backend should define allowed status transitions. UI labels may be
more user-friendly than stored status codes, but their mapping must be
consistent.

## 11. 🧪 Design QA Checklist

-   [ ] Shared header and footer are consistent across public pages.
-   [ ] Volunteer, organization, and admin navigation is
    role-appropriate.
-   [ ] Every primary page has loading, empty, error, and success states
    where applicable.
-   [ ] Forms include labels, required-field indicators, and
    understandable validation.
-   [ ] Opportunity cards display key decision-making information.
-   [ ] Application status is visible and understandable without relying
    on color.
-   [ ] Closed opportunities cannot be submitted through the UI, and the
    backend also rejects them.
-   [ ] Dashboard metrics distinguish pending from approved records.
-   [ ] No private account or application data appears in public
    screens.
-   [ ] Mobile navigation, forms, cards, tables, and dialogs work at
    narrow widths.
-   [ ] Keyboard navigation and focus indicators are usable.
-   [ ] Color contrast and meaningful image alt text are checked.
-   [ ] Destructive and consequential actions are clearly labeled and
    confirmed where appropriate.
-   [ ] UI components reuse the documented design tokens.

## 12. 🧑‍💻 Frontend Implementation Notes

Suggested React component organization:

``` text
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── TextField.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── EmptyState.jsx
│   │   └── LoadingSkeleton.jsx
│   ├── layout/
│   │   ├── SiteHeader.jsx
│   │   ├── SiteFooter.jsx
│   │   └── PageContainer.jsx
│   ├── opportunities/
│   │   ├── OpportunityCard.jsx
│   │   ├── OpportunityFilters.jsx
│   │   └── OpportunityForm.jsx
│   └── applications/
│       └── ApplicationCard.jsx
├── layouts/
├── pages/
├── routes/
├── context/
├── hooks/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

### Implementation rules

-   Use shared components instead of duplicating styles and interaction
    behavior.
-   Keep API calls in service modules rather than scattering them across
    UI components.
-   Keep server authorization authoritative.
-   Avoid storing secrets in frontend environment variables; frontend
    build variables are not secret.
-   Use semantic elements and stable, descriptive component names.
-   Keep design tokens centralized.
-   Prefer small, composable components over one large page component.
-   Document any deliberate design deviations.

## 13. 📝 Design Deliverables

Recommended design deliverables for implementation:

1.  Low-fidelity wireframes for all public and authenticated pages.
2.  A high-fidelity Home page and Opportunity Details page.
3.  Volunteer and organization dashboard designs.
4.  Registration, login, and opportunity forms.
5.  Mobile navigation and responsive states.
6.  Reusable component library and design tokens.
7.  Empty, loading, error, and success state designs.
8.  Accessibility and responsive QA checklist.
9.  Handoff notes describing component behavior and responsive rules.

## 14. 📌 Open Design Decisions

-   Confirm the primary accent color and final palette.
-   Confirm logo, brand assets, and approved social links.
-   Decide whether opportunity images are optional or required.
-   Decide whether saved opportunities are included in the first
    release.
-   Decide whether opportunity capacity and waitlists are supported.
-   Confirm whether notifications appear in-app, by email, or both.
-   Confirm which organization details are public.
-   Confirm which dashboard metrics are available from verified data.
-   Confirm final mobile navigation behavior and page-level wireframes.

------------------------------------------------------------------------

## 15. ✅ Design Definition of Done

The design is ready for implementation when: - Core pages and
role-specific navigation are specified. - Shared design tokens and
reusable components are documented. - Key user workflows have defined
interaction states. - Responsive behavior is described for mobile,
tablet, and desktop. - Accessibility requirements are included. - Forms,
statuses, empty states, and error handling are specified. - Product
decisions affecting visible behavior are resolved or explicitly
tracked. - The design is consistent with `PRD.md` and `Architecture.md`.

## 16. 📝 Document Status

This document defines the initial UI/UX design direction for
**HelpRoster --- Volunteer Opportunity Platform**, using **React +
JavaScript + Node.js + Express.js + MySQL**.

It is a design specification, not a finished visual mockup. Update it as
wireframes, final brand choices, and implementation details are
approved.
