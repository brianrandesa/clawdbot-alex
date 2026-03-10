// Create Test Client for Denise's ESA Studio Testing
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jxaktazrzcdcdrforzll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4YWt0YXpyemNkY2RyZm9yemxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjE4MTIsImV4cCI6MjA4NTk5NzgxMn0.cqmIbX2LBkehDFZRy_j1TmPtiUh-vACrGnqRgtK_y_g';

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const testClient = {
  name: "Test Client - Denise Module Audit", 
  event_name: "Real Estate Mastery Live 2026",
  knowledge_base: "3-day intensive real estate investing workshop covering wholesaling, fix-and-flip, and buy-and-hold strategies. Includes tax optimization, financing options, and market analysis. Target audience: Real estate agents, new investors, and property entrepreneurs looking to scale their business. Event focuses on practical strategies, live deal analysis, and networking opportunities.",
  avatar: "Real estate agents with 1-3 years experience, new investors who have done 0-2 deals, property entrepreneurs looking to scale from $50K to $500K annual revenue. Pain points: lack of deal flow, insufficient capital, complex tax strategies, market analysis paralysis. Desires: consistent monthly cash flow, build wealth through real estate, financial freedom within 2-3 years."
};

async function createTestClient() {
  try {
    console.log('Creating test client for Denise...');
    
    const { data, error } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating client:', error);
      return;
    }

    console.log('✅ Test client created successfully!');
    console.log('📋 Client Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Event: ${data.event_name}`);
    console.log(`   Created: ${data.created_at}`);
    console.log('\n🎯 Denise can now see this client in her ESA Studio client list and test all modules!');
    
    return data.id;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run it
createTestClient();