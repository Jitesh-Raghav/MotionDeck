-- Where each signup came from. All nullable: older rows and visits without
-- UTM parameters stay empty. The API truncates every value to 200 characters.
alter table public.waitlist
  add column if not exists utm_source text check (char_length(utm_source) <= 200),
  add column if not exists utm_medium text check (char_length(utm_medium) <= 200),
  add column if not exists utm_campaign text check (char_length(utm_campaign) <= 200),
  add column if not exists referrer text check (char_length(referrer) <= 200),
  add column if not exists landing_path text check (char_length(landing_path) <= 200);
