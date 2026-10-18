# HelpRoster --- Role-Based Workflow and User Stories

> **Project:** HelpRoster --- Volunteer Opportunity Platform\
> **Document:** `Role-Based-Workflow.md`\
> **Version:** 1.0\
> **Stack:** React + JavaScript, Node.js + Express.js, MySQL

------------------------------------------------------------------------

## 1. 🎯 Purpose

This document describes how each role uses HelpRoster, from first visit
through their main tasks. It includes role-based workflows, user
stories, acceptance criteria, permissions, alternate paths, and
end-to-end scenarios.

Roles covered: 1. Public Visitor 2. Volunteer 3. Organization
Representative 4. Platform Administrator

The goal is to guide UI design, API implementation, database design, and
testing. The backend must enforce permissions; hiding controls in the
frontend alone is not sufficient.

## 2. 👥 Role Overview

  -----------------------------------------------------------------------
  Role                    Primary goal            Main workspace
  ----------------------- ----------------------- -----------------------
  Public Visitor          Discover opportunities  Public website
                          and understand the      
                          platform                

  Volunteer               Find opportunities,     Volunteer dashboard
                          apply, track decisions, 
                          and record service      

  Organization            Publish opportunities   Organization dashboard
  Representative          and coordinate          
                          applicants              

  Platform Administrator  Moderate accounts and   Admin workspace
                          content and maintain    
                          platform integrity      
  -----------------------------------------------------------------------

### Permission principles

-   Visitors can view only public information.
-   Volunteers can manage their own profile, applications, and hour
    submissions.
-   Organization representatives can manage only organizations and
    opportunities they are authorized to manage.
-   Organization representatives can review applications and hours
    related to their own opportunities.
-   Administrators have explicitly defined moderation permissions and
    should not receive unrestricted access to every private user field
    by default.
-   Every protected API endpoint must validate authentication, role, and
    resource ownership as appropriate.

## 3. 🌐 Role 1 --- Public Visitor

### Persona story

**Maya is interested in volunteering but has not created a HelpRoster
account yet.** She wants to explore opportunities, understand what
organizations do, and decide whether the platform is right for her
before sharing personal information.

### Goals

-   Understand HelpRoster.
-   Find relevant volunteer opportunities.
-   Review opportunity and organization details.
-   Register when ready to apply.

### Workflow

``` mermaid
flowchart TD
    A[Visit HelpRoster] --> B[View Home page]
    B --> C[Browse Opportunities or Organizations]
    C --> D[Search and Filter]
    D --> E[Open Opportunity Details]
    E --> F{Wants to apply?}
    F -- No --> C
    F -- Yes --> G[Register or Log In]
    G --> H[Continue as Volunteer]
```

### User stories

**PV-01 --- Explore opportunities**

As a public visitor, I want to browse published opportunities so that I
can discover ways to contribute.

Acceptance criteria: - Only publicly visible, published opportunities
appear. - Each listing shows enough information to decide whether to
open it. - Loading, empty, and error states are clear.

**PV-02 --- Search and filter**

As a public visitor, I want to search by keywords and filter
opportunities so that I can find relevant activities.

Acceptance criteria: - Supported filters include category, location,
date, and skills when available. - Clearing filters restores the
unfiltered listing. - Pagination behaves consistently.

**PV-03 --- Review an opportunity**

As a public visitor, I want to view opportunity details so that I
understand the requirements before registering.

Acceptance criteria: - Details include the organization, description,
location, dates or time commitment, eligibility, and deadline where
relevant. - Closed or expired opportunities are clearly labeled. -
Private applicant information is never shown.

**PV-04 --- Start registration**

As a public visitor, I want to register as a volunteer so that I can
apply for opportunities.

Acceptance criteria: - The registration flow clearly identifies the
volunteer account type. - Required fields are validated on the client
and server. - A successful registration leads to the appropriate next
step.

### Alternate paths and exceptions

-   If there are no matching opportunities, show a helpful empty state
    and a way to clear filters.
-   If an opportunity no longer exists, show a not-found page.
-   If a visitor tries to apply without signing in, prompt them to
    register or log in and then return them to the opportunity when
    practical.

## 4. 🙋 Role 2 --- Volunteer

### Persona story

**Aarav is a college student who wants to contribute to local community
projects while building practical experience.** He uses HelpRoster to
find suitable activities, submit applications, monitor decisions, and
keep an accurate record of approved volunteer hours.

### Goals

-   Create and maintain a volunteer profile.
-   Discover suitable opportunities.
-   Apply without duplicate submissions.
-   Track application decisions.
-   Submit participation hours.
-   View achievements and contribution history.

### Workflow

``` mermaid
flowchart TD
    A[Register or Log In] --> B[Complete Volunteer Profile]
    B --> C[Browse Opportunities]
    C --> D[Open Opportunity Details]
    D --> E{Opportunity open and eligible?}
    E -- No --> F[View status or choose another opportunity]
    E -- Yes --> G[Submit Application]
    G --> H[Application Pending]
    H --> I{Organization decision}
    I -- Accepted --> J[Participate in Activity]
    I -- Rejected --> K[View Decision]
    I -- Pending --> L[Track Application]
    J --> M[Submit Volunteer Hours]
    M --> N[Organization Reviews Hours]
    N --> O{Hours approved?}
    O -- Yes --> P[Approved Hours and Achievements Update]
    O -- No --> Q[View Review Result]
```

### User stories

**VOL-01 --- Register and log in**

As a volunteer, I want a secure account so that my applications and
participation records are private.

Acceptance criteria: - Passwords are securely hashed on the server. -
Authentication errors do not reveal sensitive account details. -
Protected routes and APIs require authentication.

**VOL-02 --- Manage my profile**

As a volunteer, I want to update my skills, interests, and relevant
profile details so that I can find suitable opportunities.

Acceptance criteria: - Only the account owner can update their private
profile. - Required fields and lengths are validated. - Public profile
fields are explicitly selected and do not expose private data.

**VOL-03 --- Discover opportunities**

As a volunteer, I want to search and filter opportunities so that I can
choose activities that fit my interests, location, and availability.

Acceptance criteria: - Supported search and filter options work
correctly. - Results show accurate opportunity details and status. - The
backend returns only opportunities visible to the volunteer.

**VOL-04 --- Apply for an opportunity**

As a volunteer, I want to submit an application so that an organization
can consider me.

Acceptance criteria: - The volunteer is authenticated. - The opportunity
is published and open for applications. - Duplicate active applications
are prevented on the server. - The application is stored with an initial
`pending` status. - A confirmation is displayed after successful
submission.

**VOL-05 --- Track applications**

As a volunteer, I want to see my application statuses so that I know
whether I have been accepted.

Acceptance criteria: - The list includes only the signed-in volunteer's
applications. - Statuses include the agreed values such as pending,
accepted, rejected, and withdrawn. - Status updates reflect persisted
server data.

**VOL-06 --- Withdraw an application**

As a volunteer, I want to withdraw an application when I can no longer
participate.

Acceptance criteria: - Withdrawal is available only when allowed by the
product's status rules. - The server validates the current status and
ownership. - The action is recorded and shown in application history
where supported.

**VOL-07 --- Submit volunteer hours**

As a volunteer, I want to submit the time I spent on an activity so that
my contribution can be reviewed.

Acceptance criteria: - The submission includes the relevant opportunity,
activity date, and duration. - The volunteer can submit records only for
themselves. - The submission begins in a pending-review state if
approval is enabled. - Invalid or duplicate submissions are handled
according to documented rules.

**VOL-08 --- View achievements**

As a volunteer, I want to see approved hours and earned badges so that I
can understand and celebrate my contributions.

Acceptance criteria: - Only approved hours count toward official
totals. - Badges are based on documented criteria. - Pending hours and
unearned badges are not presented as completed achievements.

### Volunteer exceptions

-   **Duplicate application:** Explain that an application already
    exists and link to its status.
-   **Opportunity closes during submission:** Reject the request safely
    and ask the volunteer to refresh.
-   **Network failure:** Preserve form content where safe and allow
    retry.
-   **Hour submission rejected:** Display the review status and any
    permitted reason.
-   **Unauthorized record access:** Deny access without disclosing
    another user's data.

## 5. 🏢 Role 3 --- Organization Representative

### Persona story

**Priya coordinates volunteers for a community organization.** She needs
to publish clear opportunities, review applicants, communicate
decisions, and confirm volunteer participation without exposing
applicant information to unrelated organizations.

### Goals

-   Create an organization profile.
-   Publish and maintain opportunities.
-   Review incoming applications.
-   Accept or reject applicants.
-   Coordinate participation.
-   Review submitted volunteer hours.

### Workflow

``` mermaid
flowchart TD
    A[Register or Log In as Organization] --> B[Complete Organization Profile]
    B --> C[Create Opportunity Draft]
    C --> D[Validate Details and Preview]
    D --> E{Ready to publish?}
    E -- No --> C
    E -- Yes --> F[Publish Opportunity]
    F --> G[Receive Applications]
    G --> H[Review Applicant Details]
    H --> I{Decision}
    I -- Accept --> J[Mark Accepted]
    I -- Reject --> K[Mark Rejected]
    I -- Need more time --> L[Leave Pending]
    J --> M[Activity Takes Place]
    M --> N[Review Volunteer Hours]
    N --> O[Approve or Reject Hours]
    O --> P[Dashboard and Impact Totals Update]
```

### User stories

**ORG-01 --- Create an organization profile**

As an organization representative, I want to create a profile so that
volunteers can understand our mission.

Acceptance criteria: - The profile is linked to an authorized account. -
Required fields are validated. - Only approved public fields are shown
publicly. - If organization verification is required, publishing follows
the configured review policy.

**ORG-02 --- Create and publish opportunities**

As an organization representative, I want to publish opportunities so
that volunteers can discover activities we need help with.

Acceptance criteria: - The form captures title, description, category,
location or remote option, dates, time commitment, eligibility, and
deadline where applicable. - Drafts remain private until published. -
Only authorized representatives can edit the organization's
opportunities. - Invalid dates, deadlines, and required fields are
rejected.

**ORG-03 --- Update or close an opportunity**

As an organization representative, I want to edit or close a listing so
that its public availability remains accurate.

Acceptance criteria: - The server checks organization ownership. -
Closed or expired opportunities reject new applications. - Existing
application history remains available according to retention rules. -
Consequential actions display clear confirmation and feedback.

**ORG-04 --- Review applicants**

As an organization representative, I want to see applications for my
opportunities so that I can choose suitable volunteers.

Acceptance criteria: - Only applications for authorized opportunities
are visible. - Applicant information is limited to what is needed for
the review. - Decisions follow the defined application status
transitions. - The reviewer and decision time are recorded when
required.

**ORG-05 --- Decide on applications**

As an organization representative, I want to accept or reject applicants
so that volunteers know the outcome.

Acceptance criteria: - The API verifies the representative's permissions
and the application's current status. - Valid decisions update the
stored status. - Volunteers can see the new status. - Notifications are
sent only if the notification feature is configured.

**ORG-06 --- Review volunteer hours**

As an organization representative, I want to approve or reject submitted
hours for activities I manage so that participation records are
reliable.

Acceptance criteria: - The reviewer is authorized for the relevant
opportunity. - Hours and activity details are visible for review. - The
decision and reviewer are recorded. - Only approved records contribute
to official impact metrics.

### Organization exceptions

-   **Profile awaiting review:** Explain which actions are restricted
    until review is complete.
-   **No applicants:** Show an empty state with a link to the published
    listing.
-   **Unauthorized opportunity:** Deny access even if the representative
    manually enters its URL.
-   **Concurrent decisions:** Prevent inconsistent or contradictory
    status changes.
-   **Invalid hour submission:** Apply the documented review policy and
    show a clear result.

## 6. 🛡️ Role 4 --- Platform Administrator

### Persona story

**Neha operates the HelpRoster platform.** She helps maintain a
trustworthy directory by reviewing reported listings, managing account
status, checking organization profiles, and investigating important
administrative actions.

### Goals

-   Monitor platform activity.
-   Review organizations and listings when moderation is enabled.
-   Manage accounts under an explicit policy.
-   Handle reports and inappropriate content.
-   Audit privileged actions.

### Workflow

``` mermaid
flowchart TD
    A[Admin Sign In] --> B[Verify Admin Permission]
    B --> C[Open Admin Dashboard]
    C --> D[Review Users, Organizations, or Listings]
    D --> E{Action required?}
    E -- No --> F[Close Review]
    E -- Yes --> G[Select Moderation Action]
    G --> H[Enter Reason if Required]
    H --> I[Confirm Action]
    I --> J[Backend Validates Permission]
    J --> K[Apply Action]
    K --> L[Write Audit Record]
    L --> M[Show Confirmation]
```

### User stories

**ADM-01 --- Access the admin workspace**

As an administrator, I want a restricted admin workspace so that I can
manage platform operations securely.

Acceptance criteria: - Only authorized administrator accounts can access
admin endpoints. - The server validates the role on every privileged
request. - Failed access attempts do not expose administrative data.

**ADM-02 --- Review organization profiles**

As an administrator, I want to review organization profiles so that the
platform can apply its organization trust policy.

Acceptance criteria: - The review queue displays relevant information
and review status. - Approval or rejection follows the configured
policy. - The action and timestamp are recorded.

**ADM-03 --- Moderate opportunities**

As an administrator, I want to hide or archive inappropriate listings so
that users can browse a trustworthy directory.

Acceptance criteria: - Only authorized administrators can moderate
listings. - The reason is recorded where required. - The change takes
effect in public listings. - Existing records are preserved according to
retention rules.

**ADM-04 --- Manage accounts**

As an administrator, I want to suspend or restore accounts when policy
permits so that abuse can be addressed.

Acceptance criteria: - The action requires explicit authorization. - The
system records actor, target, timestamp, and reason where appropriate. -
The UI explains the effect of the action. - The operation does not
silently erase related records.

**ADM-05 --- Review audit history**

As an administrator with audit permission, I want to inspect privileged
actions so that I can investigate operational issues.

Acceptance criteria: - Audit entries contain relevant action metadata. -
Passwords, tokens, and unnecessary personal information are not
logged. - Audit access is restricted to authorized roles.

### Administrator safety rules

-   Require explicit confirmation for destructive or consequential
    actions.
-   Use least-privilege permissions; not every admin needs every
    capability.
-   Record moderation decisions and reasons where appropriate.
-   Never expose credentials or secrets in the admin UI.

## 7. 🔐 Role and Permission Matrix

  -----------------------------------------------------------------------------------
  Capability             Visitor      Volunteer    Organization                 Admin
  --------------- -------------- -------------- --------------- ---------------------
  Browse public              Yes            Yes             Yes                   Yes
  opportunities                                                 

  View public                Yes            Yes             Yes                   Yes
  organization                                                  
  profiles                                                      

  Apply to                    No            Yes   No by default    Only if separately
  opportunities                                                             permitted

  Manage own                  No            Yes              No  Only when explicitly
  volunteer                                                                authorized
  profile                                                       

  View own                    No            Yes              No    Restricted support
  applications                                                       access by policy

  Create/manage               No             No             Yes   Moderation/override
  owned                                                                     by policy
  opportunities                                                 

  Review                      No             No  Only for owned    Only if explicitly
  applications                                    opportunities             permitted

  Submit                      No            Yes              No    Only if separately
  volunteer hours                                                           permitted

  Review                      No             No        Only for    Only if explicitly
  volunteer hours                                       managed             permitted
                                                  opportunities 

  Manage accounts             No             No              No  Yes, within assigned
                                                                          permissions

  Moderate public             No             No              No  Yes, within assigned
  content                                                                 permissions

  View audit logs             No             No              No      Authorized admin
                                                                           roles only
  -----------------------------------------------------------------------------------

## 8. 🔄 Cross-Role End-to-End Story

### Scenario: From opportunity discovery to verified impact

1.  **Maya, a visitor**, finds a community-cleanup opportunity on the
    public listing.
2.  She reviews the organization profile, date, location, and
    requirements.
3.  She registers as a volunteer and signs in.
4.  **Maya, now a volunteer**, submits an application.
5.  The backend checks that the opportunity is open and that she has not
    already applied.
6.  **Priya, an organization representative**, reviews the application
    and accepts it.
7.  Maya sees the accepted status in her dashboard.
8.  After participating, Maya submits her volunteer hours.
9.  Priya reviews and approves the hours.
10. The platform updates Maya's approved-hour total and awards an
    achievement if its documented criteria are met.
11. **Neha, an administrator**, can audit relevant moderation or
    privileged actions if a report or operational issue arises.

### End-to-end acceptance criteria

-   Each role sees only the information and actions permitted to it.
-   Application and hour records are persisted in MySQL.
-   Status changes are validated by the backend.
-   Duplicate applications and unauthorized review actions are rejected.
-   Only approved hours contribute to official impact totals.
-   The workflow provides clear feedback at each important step.

## 9. 🧪 Role-Based Testing Scenarios

  -----------------------------------------------------------------------
  Test ID                 Scenario                Expected result
  ----------------------- ----------------------- -----------------------
  RBAC-01                 Visitor opens a public  Details are visible
                          opportunity             

  RBAC-02                 Visitor submits an      Application is
                          application without     rejected;
                          signing in              login/register path is
                                                  offered

  RBAC-03                 Volunteer requests      Access denied without
                          another volunteer's     exposing record details
                          application             

  RBAC-04                 Organization edits      Access denied
                          another organization's  
                          opportunity             

  RBAC-05                 Organization reviews an Allowed if authorized
                          application for its own 
                          opportunity             

  RBAC-06                 Organization reviews an Access denied
                          application for another 
                          organization            

  RBAC-07                 Volunteer applies twice Duplicate active
                          to the same opportunity application is rejected

  RBAC-08                 Volunteer applies to a  Request rejected
                          closed opportunity      

  RBAC-09                 Unauthorized user calls Access denied
                          an admin endpoint       

  RBAC-10                 Authorized organization Review succeeds and is
                          reviews relevant        recorded
                          volunteer hours         

  RBAC-11                 Unapproved hours are    Test fails; only
                          included in public      approved hours count
                          impact totals           

  RBAC-12                 Admin moderates a       Listing visibility
                          listing                 changes and an audit
                                                  record is written
  -----------------------------------------------------------------------

## 10. 📋 Recommended Implementation Order

1.  Define roles, permissions, and status transitions.
2.  Create database tables and constraints.
3.  Implement registration, login, and authorization middleware.
4.  Build public opportunity and organization pages.
5.  Implement organization profiles and opportunity management.
6.  Implement volunteer application submission and organization review.
7.  Build volunteer and organization dashboards.
8.  Implement volunteer-hour review and achievements.
9.  Implement admin moderation and audit history.
10. Add notifications, automated tests, accessibility checks, and
    deployment hardening.

## 11. ✅ Definition of Done

A role-based workflow is complete when: - \[ \] The story and acceptance
criteria are implemented. - \[ \] The frontend presents the correct
role-specific actions. - \[ \] The backend enforces authentication,
role, and resource ownership. - \[ \] Unauthorized access paths have
automated tests. - \[ \] Success, loading, empty, and error states are
handled. - \[ \] Database changes preserve relational integrity. - \[ \]
Sensitive information is not exposed in public APIs or logs. - \[ \]
Documentation is updated to reflect implemented behavior.

## 12. 📝 Document Status

This document is the initial role-based workflow and user-story
specification for **HelpRoster --- Volunteer Opportunity Platform**. Use
it alongside `PRD.md`, `Architecture.md`, `Design.md`, `Task.md`, and
`RULES.md`.

Names used in the stories are illustrative personas, not real platform
users. Confirm organization verification, application withdrawal,
notification behavior, and admin permissions before implementation.
