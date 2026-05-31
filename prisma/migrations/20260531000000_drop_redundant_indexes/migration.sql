-- Drop indexes that duplicate an existing unique constraint.
--
-- `user_preference_user_id_idx` is covered by the leftmost prefix of the
-- composite unique index on (user_id, notification_type, channel).
DROP INDEX "user_preference_user_id_idx";

-- `global_policy_notification_type_channel_region_idx` is identical to the
-- unique index on the same (notification_type, channel, region) tuple.
DROP INDEX "global_policy_notification_type_channel_region_idx";
