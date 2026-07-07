import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btqsumpvnoiqaioiolnk.supabase.co';
const supabaseAnonKey = 'sb_publishable_DN_mFDJVC9cads8Mv7l_jg_EvSO9Zdw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
