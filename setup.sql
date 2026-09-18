-- Plak dit in Supabase onder "SQL Editor" en druk op Run.
-- Eén keer, bij het opzetten.

create table if not exists public.tasks (
  id          text primary key,
  user_id     uuid not null default auth.uid()
              references auth.users(id) on delete cascade,
  title       text    not null default '',
  due_date    text,            -- "2026-09-18", of leeg
  due_time    text,            -- "09:30", of leeg
  done        boolean not null default false,
  created_at  bigint  not null default 0,
  updated_at  bigint  not null default 0,
  deleted     boolean not null default false
);

-- Zonder deze regel kan iedereen met de anon key alles lezen.
alter table public.tasks enable row level security;

drop policy if exists tasks_select on public.tasks;
drop policy if exists tasks_insert on public.tasks;
drop policy if exists tasks_update on public.tasks;
drop policy if exists tasks_delete on public.tasks;

create policy tasks_select on public.tasks
  for select using (auth.uid() = user_id);

create policy tasks_insert on public.tasks
  for insert with check (auth.uid() = user_id);

create policy tasks_update on public.tasks
  for update using (auth.uid() = user_id)
             with check (auth.uid() = user_id);

create policy tasks_delete on public.tasks
  for delete using (auth.uid() = user_id);

create index if not exists tasks_user_idx on public.tasks (user_id, updated_at);

-- Optioneel: verwijderde taken die ouder zijn dan 90 dagen echt opruimen.
-- De grafstenen zijn nodig zodat een verwijdering ook je andere toestel
-- bereikt; na een paar maanden mogen ze weg.
-- delete from public.tasks
--  where deleted = true
--    and updated_at < (extract(epoch from now()) * 1000) - (90::bigint * 86400000);
