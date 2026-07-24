-- Ontario Student Hub forum schema for Supabase
-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 3 and 30),
 bio text not null default '' check (char_length(bio) <= 240),
 role text not null default 'student' check (role in ('student','moderator','admin')),
 is_suspended boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists profiles_display_name_lower_idx on public.profiles(lower(display_name));

create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
 description text not null default '', icon text not null default '💬', sort_order integer not null default 0,
 is_active boolean not null default true
);

create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id),
 author_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check (char_length(title) between 8 and 120),
 body text not null check (char_length(body) between 20 and 5000),
 is_locked boolean not null default false, is_hidden boolean not null default false,
 score integer not null default 0, reply_count integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_category_idx on public.posts(category_id,created_at desc);

create table if not exists public.replies (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (char_length(body) between 10 and 3000),
 is_hidden boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists replies_post_idx on public.replies(post_id,created_at);

create table if not exists public.post_votes (
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 value smallint not null check (value in (-1,1)), created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);

create table if not exists public.reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
 post_id uuid references public.posts(id) on delete cascade, reply_id uuid references public.replies(id) on delete cascade,
 reason text not null check (char_length(reason) between 5 and 500),
 status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
 created_at timestamptz not null default now(),
 constraint exactly_one_report_target check ((post_id is not null)::int + (reply_id is not null)::int = 1)
);

create or replace function public.is_moderator() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role in ('moderator','admin') and not is_suspended)
$$;
create or replace function public.is_active_user() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and not is_suspended)
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,display_name) values(new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Student-'||substr(new.id::text,1,6)));
 return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.sync_forum_counts() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_table_name='replies' then
  update public.posts set reply_count=(select count(*) from public.replies where post_id=coalesce(new.post_id,old.post_id) and not is_hidden) where id=coalesce(new.post_id,old.post_id);
 elsif tg_table_name='post_votes' then
  update public.posts set score=(select coalesce(sum(value),0) from public.post_votes where post_id=coalesce(new.post_id,old.post_id)) where id=coalesce(new.post_id,old.post_id);
 end if; return coalesce(new,old);
end $$;
drop trigger if exists reply_count_trigger on public.replies;
create trigger reply_count_trigger after insert or update or delete on public.replies for each row execute procedure public.sync_forum_counts();
drop trigger if exists vote_score_trigger on public.post_votes;
create trigger vote_score_trigger after insert or update or delete on public.post_votes for each row execute procedure public.sync_forum_counts();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.post_votes enable row level security;
alter table public.reports enable row level security;

create policy "profiles public read" on public.profiles for select using (not is_suspended or public.is_moderator());
create policy "users update own safe profile" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid() and role='student' and is_suspended=false);
create policy "categories public read" on public.categories for select using (is_active or public.is_moderator());
create policy "mods manage categories" on public.categories for all using (public.is_moderator()) with check (public.is_moderator());
create policy "posts public read" on public.posts for select using (not is_hidden or public.is_moderator());
create policy "active users create posts" on public.posts for insert with check (author_id=auth.uid() and public.is_active_user() and is_locked=false and is_hidden=false and score=0 and reply_count=0);
create policy "authors edit own posts" on public.posts for update using ((author_id=auth.uid() and public.is_active_user()) or public.is_moderator()) with check ((author_id=auth.uid() and public.is_active_user()) or public.is_moderator());
create policy "authors or mods delete posts" on public.posts for delete using (author_id=auth.uid() or public.is_moderator());
create policy "replies public read" on public.replies for select using (not is_hidden or public.is_moderator());
create policy "active users create replies" on public.replies for insert with check (author_id=auth.uid() and public.is_active_user() and is_hidden=false and exists(select 1 from public.posts p where p.id=post_id and not p.is_locked and not p.is_hidden));
create policy "authors edit replies" on public.replies for update using ((author_id=auth.uid() and public.is_active_user()) or public.is_moderator()) with check ((author_id=auth.uid() and public.is_active_user()) or public.is_moderator());
create policy "authors or mods delete replies" on public.replies for delete using (author_id=auth.uid() or public.is_moderator());
create policy "votes public read" on public.post_votes for select using (true);
create policy "users manage own votes" on public.post_votes for all using (user_id=auth.uid()) with check (user_id=auth.uid() and public.is_active_user());
create policy "users create reports" on public.reports for insert with check (reporter_id=auth.uid() and public.is_active_user() and status='open');
create policy "reporter or mods read reports" on public.reports for select using (reporter_id=auth.uid() or public.is_moderator());
create policy "mods update reports" on public.reports for update using (public.is_moderator()) with check (public.is_moderator());

insert into public.categories(name,slug,description,icon,sort_order) values
('Homework Help','homework-help','Ask for explanations and guidance without requesting copied answers.','📝',10),
('Mathematics','mathematics','Algebra, geometry, trigonometry, functions, calculus, and data.','📐',20),
('Science','science','Biology, chemistry, physics, Earth science, and labs.','🔬',30),
('English & Literacy','english-literacy','Reading, writing, essays, research, and OSSLT preparation.','📚',40),
('History, Civics & Geography','social-studies','Canadian history, world history, government, law, geography, and citizenship.','🏛️',50),
('Courses & Pathways','courses-pathways','Course planning, prerequisites, university, college, apprenticeship, and careers.','🧭',60),
('Study Skills','study-skills','Planning, memory, test preparation, and learning strategies.','🧠',70),
('Site Feedback','site-feedback','Suggest corrections and improvements to the learning portal.','💡',80)
on conflict (slug) do nothing;
