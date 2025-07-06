// Firebase configuration and initialization
// Note: In production, these would be environment variables through Supabase integration
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "greengrade-demo.firebaseapp.com",
  projectId: "greengrade-demo",
  storageBucket: "greengrade-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Mock Firebase functions for demonstration
export const db = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: Math.random() > 0.5, // 50% chance product exists in cache
        data: () => mockSustainabilityData()
      }),
      set: async (data: any) => {
        console.log(`Storing to Firestore collection ${name}:`, data);
        return Promise.resolve();
      }
    })
  })
};

function mockSustainabilityData() {
  const scores = [85, 72, 91, 45, 67, 88, 34, 76, 82, 59];
  const score = scores[Math.floor(Math.random() * scores.length)];
  
  return {
    sustainabilityScore: score,
    carbonFootprint: Math.floor(Math.random() * 500) + 50,
    packagingMaterial: ['Recyclable Cardboard', 'Biodegradable Plastic', 'Glass', 'Mixed Materials'][Math.floor(Math.random() * 4)],
    countryOfOrigin: ['USA', 'Germany', 'Japan', 'Canada', 'Netherlands'][Math.floor(Math.random() * 5)],
    dataSource: 'Environmental Impact Database',
    lastUpdated: new Date().toISOString()
  };
}

export { firebaseConfig };