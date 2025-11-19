import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Update download history status
 */
export async function updateDownloadHistory(historyId, updates) {
  try {
    const { data, error } = await supabase
      .from('download_history')
      .update(updates)
      .eq('id', historyId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating download history:', error);
    throw error;
  }
}

/**
 * Get download history by ID
 */
export async function getDownloadHistory(historyId) {
  try {
    const { data, error } = await supabase
      .from('download_history')
      .select('*')
      .eq('id', historyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting download history:', error);
    throw error;
  }
}
