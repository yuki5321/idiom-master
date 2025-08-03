export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/records' && request.method === 'POST') {
        // Save learning record
        const body = await request.json();
        const { user_id, phrase, status, timestamp } = body;

        const stmt = env.DB.prepare(
          'INSERT INTO learning_records (user_id, phrase, status, timestamp) VALUES (?, ?, ?, ?)'
        );
        await stmt.bind(user_id, phrase, status, timestamp).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/records' && request.method === 'GET') {
        // Get user's learning records
        const user_id = url.searchParams.get('user_id');
        
        if (!user_id) {
          return new Response(JSON.stringify({ error: 'user_id is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const stmt = env.DB.prepare(
          'SELECT * FROM learning_records WHERE user_id = ? ORDER BY timestamp DESC'
        );
        const result = await stmt.bind(user_id).all();

        return new Response(JSON.stringify({ records: result.results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/records' && request.method === 'DELETE') {
        // Delete user's learning records
        const user_id = url.searchParams.get('user_id');
        
        if (!user_id) {
          return new Response(JSON.stringify({ error: 'user_id is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const stmt = env.DB.prepare('DELETE FROM learning_records WHERE user_id = ?');
        await stmt.bind(user_id).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
}; 