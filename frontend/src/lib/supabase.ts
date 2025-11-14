import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please check SUPABASE_SETUP.md');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Types for database tables
export interface GameState {
  id: string;
  game_id: string;
  player1_address: string;
  player2_address?: string;
  player1_character: string;
  player2_character?: string;
  player1_health: number;
  player2_health: number;
  current_turn: number;
  is_player1_turn: boolean;
  theme: string;
  is_ai: boolean;
  status: 'active' | 'finished' | 'abandoned';
  winner?: string;
  player1_blocks_next: boolean;
  player2_blocks_next: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameMove {
  id: string;
  game_id: string;
  player_address: string;
  move_type: 'attack' | 'defend' | 'special';
  damage_dealt: number;
  special_move?: 'burn' | 'ice' | 'cut';
  taunt_message?: string;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  wallet_address: string;
  total_wins: number;
  total_games: number;
  nfts_earned: number;
  favorite_character?: string;
  created_at: string;
  updated_at: string;
}