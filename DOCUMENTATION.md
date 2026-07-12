# LinkedOut Job Portal Documentation

This document outlines the core features, workflows, and technical mechanics of the LinkedOut Job Portal, a dual-sided platform for candidates and employers.

---

## 1. Authentication & Roles

The platform supports two distinct user roles: **Candidate** (Job Seeker) and **Employer**.

- **Registration**: Users must select a role during sign-up. Passwords require a minimum of 6 characters, including at least 1 uppercase letter and 1 number. Registration includes a password visibility toggle.
- **Security**: Sessions are managed via secure, HTTP-only JWT cookies.
- **Access Control**: Unauthenticated users are restricted from viewing jobs, companies, or dashboards. The navigation bar dynamically adapts to display only role-appropriate links.

---

## 2. Candidate Workflows

### Profile & Resume Management
- **Profile Configuration**: Candidates can update their objective summary, core skills, and save default answers to a Global Screening Question Bank (FAQs).
- **Cloud Portfolio**: Upload multiple resumes (PDF/DOCX) securely to Cloudinary.
- **Resume Actions**: Candidates can set a default "Active" resume, preview uploads via an inline document viewer, and delete outdated files.

### Job Discovery
- **Search & Filter**: Query active job postings by location, job type (Remote, Hybrid, On-site), and salary tier.
- **Saved Jobs**: Bookmark listings to a personal "Saved Jobs" cart for future review.

### Application Process
A multi-step application wizard facilitates submissions:
1. **Resume Selection**: Choose an existing portfolio resume or upload a new one directly.
2. **Cover Letter**: Submit a custom, role-specific cover letter.
3. **Screening Questions**: Provide answers to any custom questions defined by the employer. *Answers are automatically pre-filled from your Profile's FAQ bank if they match, and any new answers are seamlessly saved back to your profile.*
4. **Evaluation**: Upon submission, the system automatically calculates an ATS (Applicant Tracking System) fit score based on profile and job requirement matching.

### Application Tracking
- **Dashboard**: Monitor active applications, average ATS scores, and real-time statuses (Applied, Screening, Interview, Offer, Rejected).
- **Submission History**: Preview the exact resume submitted for any past application.
- **Notifications**: Receive instant dashboard alerts when an employer updates an application's status.

---

## 3. Employer Workflows

### Company Profile
- **Brand Management**: Define the company's identity by updating the name, description, industry, website, location, and logo.

### Job Posting Management
- **Creation**: Define job parameters including title, salary range, location, type, and optional application deadline dates. 
- **Screening Form Builder**: Employers can write mandatory screening questions for applicants or quickly add them using the "Suggested FAQs" quick-add feature.
- **Lifecycle Control**: From the dashboard, employers can toggle job statuses between Open and Closed, or permanently Delete postings.

### Applicant Tracking System (ATS)
- **Applicant Data Table**: Review candidates for a specific role in a tabular format showing Name, Email, ATS Fit Score, and current Pipeline Status.
- **Detailed Review**: Expand individual rows to evaluate the candidate's cover letter and screening answers.
- **Pipeline Management**: Update candidate statuses (Applied -> Screening -> Interview -> Offer -> Rejected). This action automatically triggers a notification for the candidate.

### Document Review & Export
- **Resume Viewer**: Preview candidate resumes directly within the browser using a secure iframe modal. Opening the viewer automatically updates the candidate's status to "Resume Viewed".
- **Direct Download**: Download candidate resumes directly to local storage.
- **CSV Export**: Export role-specific applicant data to a spreadsheet. The export separates "Resume Name" and "Resume URL" into distinct columns for offline accessibility.

---

## 4. Technical Mechanics

- **Role-Based UI Segregation**: Employers cannot apply for or save jobs; candidates cannot access hiring or analytics tools.
- **Responsive Design**: The interface is fully responsive, utilizing a collapsible hamburger menu for mobile navigation.
- **Document Security**: External resume previews are sandboxed within secure iframes, while integrated with Cloudinary for reliable PDF and image rendering.
