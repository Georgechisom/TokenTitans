# TokenTitans Supabase Setup Guide

## Overview

This guide will help you set up Supabase for the TokenTitans game backend.

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js installed
- Project cloned locally

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - Name: `tokentitans` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Database Schema Setup

Run these SQL commands in the Supabase SQL Editor (Dashboard > SQL Editor > New Query):

### 1. Create Game States Table

```sql
-- Game states table
create table public.game_states (
  id uuid primary key default gen_random_uuid(),
  game_id text unique not null,
  player1_address text not null,
  player2_address text,
  player1_character text not null,
  player2_character text,
  player1_health integer default 100,
  player2_health integer default 100,
  current_turn integer default 1,
  is_player1_turn boolean default true,
  theme text not null,
  is_ai boolean default false,
  status text default 'active', -- active, finished, abandoned
  winner text,
  player1_blocks_next boolean default false,
  player2_blocks_next boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.game_states enable row level security;

-- Players can read their own games
create policy "Players can view their games"
  on public.game_states
  for select
  using (
    auth.uid()::text = player1_address
    or auth.uid()::text = player2_address
  );

-- Anyone can create a game
create policy "Anyone can create games"
  on public.game_states
  for insert
  with check (true);

-- Players can update their own games
create policy "Players can update their games"
  on public.game_states
  for update
  using (
    auth.uid()::text = player1_address
    or auth.uid()::text = player2_address
  );
```

### 2. Create Game Moves Table

```sql
-- Game moves history
create table public.game_moves (
  id uuid primary key default gen_random_uuid(),
  game_id text references public.game_states(game_id) on delete cascade,
  player_address text not null,
  move_type text not null, -- attack, defend, special
  damage_dealt integer default 0,
  special_move text, -- burn, ice, cut
  taunt_message text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.game_moves enable row level security;

-- Anyone can read move history for games they're in
create policy "Players can view game moves"
  on public.game_moves
  for select
  using (
    exists (
      select 1 from public.game_states gs
      where gs.game_id = game_moves.game_id
      and (gs.player1_address = auth.uid()::text or gs.player2_address = auth.uid()::text)
    )
  );

-- Players can insert moves
create policy "Players can insert moves"
  on public.game_moves
  for insert
  with check (true);
```

### 3. Create Leaderboard Table

```sql
-- Player stats for leaderboard
create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  total_wins integer default 0,
  total_games integer default 0,
  nfts_earned integer default 0,
  favorite_character text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.player_stats enable row level security;

-- Anyone can read leaderboard
create policy "Anyone can view leaderboard"
  on public.player_stats
  for select
  using (true);

-- Players can update their own stats
create policy "Players can update their stats"
  on public.player_stats
  for update
  using (auth.uid()::text = wallet_address);

-- Players can insert their stats
create policy "Players can insert their stats"
  on public.player_stats
  for insert
  with check (auth.uid()::text = wallet_address);
```

### 4. Create Functions for Game Logic

```sql
-- Function to update game state
create or replace function public.make_move(
  p_game_id text,
  p_player_address text,
  p_move_type text,
  p_special_move text default null,
  p_taunt text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_game record;
  v_damage integer := 0;
  v_is_blocked boolean := false;
  v_result json;
begin
  -- Get current game state
  select * into v_game from public.game_states where game_id = p_game_id;

  if not found then
    return json_build_object('error', 'Game not found');
  end if;

  -- Calculate damage and blocking
  if p_move_type = 'attack' then
    v_damage := 20;
    -- Check if opponent blocked
    if (p_player_address = v_game.player1_address and v_game.player2_blocks_next) or
       (p_player_address = v_game.player2_address and v_game.player1_blocks_next) then
      v_damage := 0;
      v_is_blocked := true;
    end if;
  elsif p_move_type = 'special' then
    v_damage := 40;
  end if;

  -- Update health
  if p_player_address = v_game.player1_address then
    update public.game_states
    set
      player2_health = greatest(0, player2_health - v_damage),
      player1_blocks_next = false,
      player2_blocks_next = case when p_move_type = 'defend' then true else false end,
      is_player1_turn = false,
      current_turn = current_turn + 1,
      updated_at = now()
    where game_id = p_game_id;
  else
    update public.game_states
    set
      player1_health = greatest(0, player1_health - v_damage),
      player2_blocks_next = false,
      player1_blocks_next = case when p_move_type = 'defend' then true else false end,
      is_player1_turn = true,
      current_turn = current_turn + 1,
      updated_at = now()
    where game_id = p_game_id;
  end if;

  -- Log the move
  insert into public.game_moves (game_id, player_address, move_type, damage_dealt, special_move, taunt_message)
  values (p_game_id, p_player_address, p_move_type, v_damage, p_special_move, p_taunt);

  return json_build_object(
    'success', true,
    'damage', v_damage,
    'blocked', v_is_blocked
  );
end;
$$;
```

### 5. Enable Realtime (Optional but Recommended)

```sql
-- Enable realtime for game updates
alter publication supabase_realtime add table public.game_states;
alter publication supabase_realtime add table public.game_moves;
```

## Step 4: Configure Your App

Update `src/lib/supabase.ts` with your credentials (file will be created automatically).

## Step 5: Test Connection

Run your app:

```bash
npm run dev
```

Check browser console for successful connection.

## Optional: Set Up Edge Functions for AI

If you want server-side AI logic:

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Login:

```bash
supabase login
```

3. Link project:

```bash
supabase link --project-ref your_project_id
```

4. Deploy functions:

```bash
supabase functions deploy ai-opponent
```

## Security Notes

⚠️ **Important Security Practices:**

- Never commit `.env.local` to Git
- Use RLS policies for all tables
- Validate all inputs on the server side
- Use Supabase Auth for user management
- Keep your anon key public, but service role key SECRET

## Troubleshooting

**Connection Issues:**

- Verify .env.local has correct URL and key
- Check if Supabase project is active
- Ensure network allows Supabase connections

**RLS Errors:**

- Verify RLS policies are created
- Check auth.uid() matches wallet addresses
- Test with SQL editor first

**Performance:**

- Add indexes on frequently queried columns
- Use Supabase caching where possible
- Monitor database usage in dashboard

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run SQL schema
3. ✅ Configure environment variables
4. 🎮 Connect wallet and start playing!
5. 🚀 Deploy to production

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: Create issue in your repo

---

**Ready to Battle!** 🔥💀⚔️
