-- SIT schema v1.0 - Day 5: Storage bucket for private page assets (avatars)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'page-assets',
  'page-assets',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
