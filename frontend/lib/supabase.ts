import { createClient } from '@supabase/supabase-js';
import { User, TrustScore } from '@/types';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://ssishktinopnepbydsgh.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaXNoa3Rpbm9wbmVwYnlkc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODg0MDcsImV4cCI6MjEwMzc2NDQwN30.LjGiUV9bpbfIzyas1QKq4PC5slYAChhYVEHikwGsMro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone_number || '',
      role: data.user_type,
      avatar_url: data.avatar_url,
      region: data.region,
      kyc_verified: data.kyc_verified,
      created_at: data.created_at,
    } as unknown as User;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function fetchUserTrustScore(userId: string): Promise<TrustScore | null> {
  try {
    const { data, error } = await supabase
      .from('trust_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        user_id: userId,
        score: 100,
        tier: 'bronze',
        digital_on_time_count: 0,
        cash_on_time_count: 0,
        late_count: 0,
        updated_at: new Date().toISOString(),
      };
    }

    let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (data.score >= 800) tier = 'platinum';
    else if (data.score >= 700) tier = 'gold';
    else if (data.score >= 500) tier = 'silver';

    return {
      user_id: data.user_id,
      score: data.score,
      tier,
      digital_on_time_count: data.total_on_time || 0,
      cash_on_time_count: 0,
      late_count: data.total_late || 0,
      updated_at: data.last_updated || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching trust score:', err);
    return null;
  }
}
