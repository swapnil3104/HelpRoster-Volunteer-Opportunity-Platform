-- ============================================================================
-- Seed: 002_sample_data.sql
-- Description: Development-only sample users, organizations, opportunities,
--              applications, volunteer hours, and contact submissions.
-- NOTICE: NON-PRODUCTION DEVELOPMENT DATA ONLY.
-- Standard demo password for all seeded users: Password123!
-- Bcrypt Hash: $2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Demo Users
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `status`) VALUES
(1, 'admin@helproster.org', '$2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW', 'Platform', 'Admin', 'admin', 'active'),
(2, 'contact@greenearth.org', '$2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW', 'Elena', 'Rostova', 'organization', 'active'),
(3, 'director@hopereading.org', '$2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW', 'Marcus', 'Vance', 'organization', 'active'),
(4, 'jane.doe@example.com', '$2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW', 'Jane', 'Doe', 'volunteer', 'active'),
(5, 'alex.smith@example.com', '$2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW', 'Alex', 'Smith', 'volunteer', 'active'),
(6, 'sarah.jenkins@example.com', '$2a$10$GS/9cQkXrKp6q.2XZYAUJee/ylyNTNhJ0LhQzzUef9rfDUlwZjDYW', 'Sarah', 'Jenkins', 'volunteer', 'active')
ON DUPLICATE KEY UPDATE
  `email` = VALUES(`email`),
  `first_name` = VALUES(`first_name`),
  `last_name` = VALUES(`last_name`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`);

-- 2. Volunteer Profiles
INSERT INTO `volunteer_profiles` (`id`, `user_id`, `phone`, `bio`, `skills`, `interests`, `location`, `availability`, `is_public`) VALUES
(1, 4, '+1-555-0144', 'Passionate community organizer and nature enthusiast with 5+ years of volunteer experience.', 'Community Outreach, Event Coordination, First Aid, Gardening', 'Environment, Food Security, Community Development', 'Seattle, WA', 'Weekends and weekday evenings', 1),
(2, 5, '+1-555-0182', 'University student studying Computer Science and education, eager to mentor kids and teach coding.', 'Tutoring, Python, Graphic Design, Social Media, Public Speaking', 'Education & Literacy, Youth & Children, STEM', 'Portland, OR', 'Flexible weekday afternoons', 1),
(3, 6, '+1-555-0199', 'Registered nurse dedicated to community health clinics and emergency wellness initiatives.', 'Patient Care, Triage, Health Screening, CPR Certified, Disaster Preparedness', 'Healthcare & Wellness, Disaster Relief, Seniors & Elder Care', 'Seattle, WA', 'Saturdays and bi-weekly Sundays', 1)
ON DUPLICATE KEY UPDATE
  `phone` = VALUES(`phone`),
  `bio` = VALUES(`bio`),
  `skills` = VALUES(`skills`),
  `interests` = VALUES(`interests`),
  `location` = VALUES(`location`),
  `availability` = VALUES(`availability`),
  `is_public` = VALUES(`is_public`);

-- 3. Organizations
INSERT INTO `organizations` (`id`, `user_id`, `name`, `description`, `mission`, `logo_url`, `website`, `email`, `phone`, `address`, `city`, `state`, `country`, `postal_code`, `verification_status`) VALUES
(1, 2, 'Green Earth Alliance', 'A grassroots non-profit dedicated to urban reforestation, clean waterways, and community garden education across the Pacific Northwest.', 'To foster climate resilience and empower citizens through hands-on ecological conservation.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200', 'https://greenearthalliance.demo.org', 'contact@greenearth.org', '+1-555-0122', '1240 Pine Street', 'Seattle', 'WA', 'USA', '98101', 'verified'),
(2, 3, 'Hope Literacy Project', 'Empowering underserved youth and adults with literacy tutoring, bilingual reading groups, and free access to community book libraries.', 'Breaking educational barriers through accessible, one-on-one literacy mentorship.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200', 'https://hopereading.demo.org', 'director@hopereading.org', '+1-555-0133', '855 University Ave', 'Portland', 'OR', 'USA', '97201', 'verified')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `mission` = VALUES(`mission`),
  `website` = VALUES(`website`),
  `email` = VALUES(`email`),
  `city` = VALUES(`city`),
  `state` = VALUES(`state`),
  `verification_status` = VALUES(`verification_status`);

-- 4. Opportunities
INSERT INTO `opportunities` (`id`, `organization_id`, `category_id`, `title`, `slug`, `description`, `requirements`, `responsibilities`, `location_type`, `location`, `start_date`, `end_date`, `application_deadline`, `commitment_hours`, `capacity`, `status`, `created_by`) VALUES
(1, 1, 2, 'Urban Reforestation & Native Tree Planting', 'urban-reforestation-native-tree-planting', 'Join our team as we plant 300 native Douglas fir and cedar saplings along the greenway corridor to combat heat islands.', 'Ability to lift 15 lbs, comfortable working outdoors in rain or shine. Work gloves recommended.', 'Digging planting basins, mulching saplings, watering root zones, and tracking planted GPS coordinates.', 'on_site', 'Discovery Park, Seattle, WA', '2026-11-15', '2026-11-15', '2026-11-10 23:59:59', 4, 30, 'published', 2),
(2, 2, 1, 'Youth After-School Reading Mentors', 'youth-after-school-reading-mentors', 'Provide weekly one-on-one reading assistance and homework coaching to elementary school students at our community center.', 'High school diploma or active student standing. Background check required prior to start.', 'Read aloud with students, assess reading comprehension, facilitate vocabulary games, and report weekly progress.', 'hybrid', 'Portland Community Hub & Zoom', '2026-11-01', '2027-02-28', '2026-10-28 23:59:59', 3, 12, 'published', 3),
(3, 1, 2, 'Alki Beach Coastline Cleanup & Microplastic Survey', 'alki-beach-coastline-cleanup', 'Help preserve Puget Sound marine wildlife by collecting coastal debris and documenting microplastic samples for our conservation audit.', 'All ages welcome. Closed-toe shoes required.', 'Debris pickup along shoreline, data collection on debris categories, sorting recyclable materials.', 'on_site', 'Alki Beach Promenade, Seattle, WA', '2026-11-20', '2026-11-20', '2026-11-18 18:00:00', 3, 50, 'published', 2),
(4, 2, 1, 'Bilingual Community Book Drive Coordinator', 'bilingual-community-book-drive', 'Help collect, catalogue, and distribute Spanish and English children books to local preschools and family shelters.', 'Organizational skills, friendly customer engagement. Conversational Spanish is a plus but not required.', 'Station volunteer at library drop-off, verify book conditions, organize inventory into grade levels.', 'on_site', 'Central Library, Portland, OR', '2026-12-05', '2026-12-06', '2026-12-01 23:59:59', 6, 8, 'draft', 3),
(5, 1, 6, 'Community Garden Winterization Workshop', 'community-garden-winterization-workshop', 'Prepare neighborhood garden beds for the winter freeze with cover crops, compost spreading, and rain barrel maintenance.', 'Enthusiasm for urban farming and sustainable agriculture.', 'Spreading mulch and organic compost, trimming perennials, cleaning community tools.', 'on_site', 'Beacon Hill Food Forest, Seattle, WA', '2026-10-25', '2026-10-25', '2026-10-23 23:59:59', 4, 20, 'closed', 2)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `slug` = VALUES(`slug`),
  `description` = VALUES(`description`),
  `status` = VALUES(`status`),
  `capacity` = VALUES(`capacity`);

-- 5. Opportunity Skills
INSERT INTO `opportunity_skills` (`opportunity_id`, `skill_name`) VALUES
(1, 'Gardening & Landscaping'),
(1, 'Physical Stamina'),
(1, 'Teamwork'),
(2, 'Reading Tutoring'),
(2, 'Patience with Children'),
(2, 'Active Listening'),
(3, 'Environmental Science'),
(3, 'Data Collection'),
(4, 'Inventory Management'),
(4, 'Bilingual Communication'),
(5, 'Composting & Mulching'),
(5, 'Tool Maintenance')
ON DUPLICATE KEY UPDATE `skill_name` = VALUES(`skill_name`);

-- 6. Applications
INSERT INTO `applications` (`id`, `opportunity_id`, `volunteer_id`, `status`, `message`, `reviewed_by`, `reviewed_at`, `review_notes`) VALUES
(1, 1, 4, 'accepted', 'I have participated in multiple trail work parties and look forward to planting saplings at Discovery Park!', 2, '2026-10-15 11:30:00', 'Great background and experience with outdoor conservation projects.'),
(2, 2, 5, 'pending', 'As a college student with previous youth camp mentoring experience, I would love to support reading comprehension for elementary pupils.', NULL, NULL, NULL),
(3, 3, 6, 'accepted', 'Passionate about environmental health and happy to assist with the coastal survey and safety station.', 2, '2026-10-16 09:15:00', 'Accepted. First aid certification is a wonderful asset for the team.')
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`),
  `message` = VALUES(`message`),
  `review_notes` = VALUES(`review_notes`);

-- 7. Volunteer Hours
INSERT INTO `volunteer_hours` (`id`, `volunteer_id`, `opportunity_id`, `activity_date`, `hours`, `description`, `status`, `reviewed_by`, `reviewed_at`, `feedback`) VALUES
(1, 4, 1, '2026-10-10', 4.00, 'Assisted with soil testing and initial layout for Discovery Park nursery zone.', 'approved', 2, '2026-10-11 14:00:00', 'Excellent preparation work and punctuality. Thank you Jane!'),
(2, 6, 3, '2026-10-12', 3.50, 'Preliminary coastal path survey and plastic trap inspection.', 'approved', 2, '2026-10-13 16:30:00', 'Thorough notes provided on coastline debris clusters.'),
(3, 4, 1, '2026-10-17', 2.50, 'Organized tool shed and inspected seedling root balls prior to planting day.', 'pending', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE
  `hours` = VALUES(`hours`),
  `status` = VALUES(`status`),
  `feedback` = VALUES(`feedback`);

-- 8. User Achievements
INSERT INTO `user_achievements` (`id`, `user_id`, `achievement_id`, `earned_at`) VALUES
(1, 4, 1, '2026-10-10 10:00:00'),
(2, 6, 1, '2026-10-12 11:00:00')
ON DUPLICATE KEY UPDATE `earned_at` = VALUES(`earned_at`);

-- 9. Contact Submissions
INSERT INTO `contact_submissions` (`id`, `name`, `email`, `subject`, `message`, `status`) VALUES
(1, 'David Miller', 'david.miller@citytech.com', 'Corporate Volunteer Days Inquiry', 'Hello HelpRoster team, our company has 50 employees interested in a collaborative environmental volunteer day. How can we coordinate with registered non-profits?', 'new'),
(2, 'Maria Santos', 'maria.santos@localfoundation.org', 'Adding educational grants for volunteers', 'We are a local community foundation offering small grants for volunteer initiatives. We would love to feature grant opportunities on your platform.', 'in_progress')
ON DUPLICATE KEY UPDATE
  `subject` = VALUES(`subject`),
  `status` = VALUES(`status`);

SET FOREIGN_KEY_CHECKS = 1;
