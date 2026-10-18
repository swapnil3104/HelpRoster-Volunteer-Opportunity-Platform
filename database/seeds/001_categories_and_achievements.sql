-- ============================================================================
-- Seed: 001_categories_and_achievements.sql
-- Description: Core baseline categories and achievement badge definitions
-- ============================================================================

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `is_active`) VALUES
(1, 'Education & Literacy', 'education-literacy', 'Tutoring, book drives, STEM mentoring, and literacy workshops for all ages.', 'book-open', 1),
(2, 'Environmental Conservation', 'environmental-conservation', 'Tree planting, beach/park cleanups, recycling drives, and ecological restoration.', 'leaf', 1),
(3, 'Healthcare & Wellness', 'healthcare-wellness', 'Health clinics, mental wellness advocacy, blood drives, and patient care support.', 'heart-pulse', 1),
(4, 'Food Security & Hunger Relief', 'food-security-hunger', 'Food pantry operations, soup kitchen meal prep, and surplus food distribution.', 'utensils', 1),
(5, 'Animal Welfare', 'animal-welfare', 'Shelter animal care, foster pet assistance, wildlife rehabilitation, and adoption fairs.', 'paw', 1),
(6, 'Community Development', 'community-development', 'Neighborhood revitalization, affordable housing construction, and local events.', 'building', 1),
(7, 'Disaster Relief & Emergency Support', 'disaster-relief', 'Disaster preparation, crisis response, donation sorting, and rebuilding support.', 'shield-alert', 1),
(8, 'Youth & Children', 'youth-children', 'After-school coaching, youth camps, leadership mentoring, and creative arts.', 'smile', 1),
(9, 'Seniors & Elder Care', 'seniors-elder-care', 'Companionship visits, digital literacy assistance, and mobility support for seniors.', 'heart-handshake', 1)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `icon` = VALUES(`icon`),
  `is_active` = VALUES(`is_active`);

-- Achievements
INSERT INTO `achievements` (`id`, `code`, `title`, `description`, `badge_icon`, `criteria_type`, `criteria_threshold`) VALUES
(1, 'FIRST_STEP', 'First Step', 'Submitted your first volunteer application on HelpRoster.', 'award-bronze', 'first_step', 1),
(2, 'HELPING_HAND_10', 'Helping Hand (10 hrs)', 'Logged 10 verified volunteer service hours.', 'clock-10', 'hours_milestone', 10),
(3, 'COMMUNITY_PILLAR_50', 'Community Pillar (50 hrs)', 'Logged 50 verified volunteer service hours.', 'clock-50', 'hours_milestone', 50),
(4, 'CENTURION_100', 'Centurion (100 hrs)', 'Logged 100 verified volunteer service hours.', 'clock-100', 'hours_milestone', 100),
(5, 'ACTIVE_CONTRIBUTOR', 'Active Contributor', 'Had 5 volunteer applications accepted by organizations.', 'check-circle-5', 'applications_accepted', 5),
(6, 'CAUSE_EXPLORER', 'Cause Explorer', 'Volunteered across 3 or more distinct cause categories.', 'compass-3', 'categories_explored', 3)
ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `badge_icon` = VALUES(`badge_icon`),
  `criteria_type` = VALUES(`criteria_type`),
  `criteria_threshold` = VALUES(`criteria_threshold`);
