-- Resume hub is shipped; catalog badge should not show "Soon" for old DB rows.
UPDATE "Feature" SET "status" = 'live' WHERE "id" = 'resume-ai';
