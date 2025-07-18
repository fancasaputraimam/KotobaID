// Simple test to verify AI integration works
const testAIIntegration = async () => {
  console.log('Testing AI integration...');
  
  // Test queries that likely won't be in Firestore
  const testQueries = [
    'kucing', // Indonesian word
    'computer', // English word
    'テスト', // Japanese word unlikely to be in fallback
    'programming'
  ];
  
  for (const query of testQueries) {
    console.log(`\nTesting query: "${query}"`);
    
    try {
      // Simulate the dictionary search flow
      const response = await fetch(`http://localhost:5179/api/dictionary/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Found ${data.entries?.length || 0} results`);
        
        if (data.entries && data.entries.length > 0) {
          const firstEntry = data.entries[0];
          console.log(`  - Word: ${firstEntry.word}`);
          console.log(`  - Reading: ${firstEntry.reading}`);
          console.log(`  - Source: ${firstEntry.source}`);
          console.log(`  - Meanings: ${firstEntry.meanings?.length || 0}`);
        }
      } else {
        console.log(`✗ Request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error(`✗ Error testing "${query}":`, error.message);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// Run the test
testAIIntegration().catch(console.error);