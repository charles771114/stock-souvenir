-- One-time cleanup of redundant group records
DELETE FROM public.line_groups WHERE group_id = '您的_GROUP_ID';
-- Also remove the suspicious 'U' group (Cd9d209511da4d90532e5700dc643d12)
DELETE FROM public.line_groups WHERE group_id = 'Cd9d209511da4d90532e5700dc643d12';
