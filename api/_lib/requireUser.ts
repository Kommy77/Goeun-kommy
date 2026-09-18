import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Verifies the caller's Supabase access token so these endpoints (which
 * call the paid/rate-limited Gemini API) can't be hit anonymously by
 * anyone who finds the URL. Returns the authenticated user id, or null
 * after writing a 401 response.
 */
export async function requireUser(req: VercelRequest, res: VercelResponse): Promise<string | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return null;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server is missing Supabase configuration' });
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }

  return data.user.id;
}
