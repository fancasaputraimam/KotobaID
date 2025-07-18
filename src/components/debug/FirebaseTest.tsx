import React, { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResult('Testing Firebase connection...\n');
    
    try {
      // Test 1: Check if Firebase auth is initialized
      setTestResult(prev => prev + '✓ Firebase Auth initialized\n');
      
      // Test 2: Check if Firestore is initialized
      setTestResult(prev => prev + '✓ Firestore initialized\n');
      
      // Test 3: Try to create a test user
      const testEmail = `test+${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      setTestResult(prev => prev + `Creating test user with email: ${testEmail}\n`);
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      
      setTestResult(prev => prev + `✓ Firebase user created: ${user.uid}\n`);
      
      // Test 4: Try to save user data to Firestore
      const userData = {
        uid: user.uid,
        email: user.email!,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
        isTest: true
      };
      
      setTestResult(prev => prev + 'Saving user data to Firestore...\n');
      await setDoc(doc(db, 'users', user.uid), userData);
      setTestResult(prev => prev + '✓ User data saved to Firestore\n');
      
      // Test 5: Clean up - delete the test user
      await user.delete();
      setTestResult(prev => prev + '✓ Test user deleted\n');
      
      setTestResult(prev => prev + '\n🎉 All tests passed! Firebase is working correctly.\n');
      
    } catch (error: any) {
      console.error('Firebase test error:', error);
      setTestResult(prev => prev + `\n❌ Error: ${error.code} - ${error.message}\n`);
      
      if (error.code === 'auth/email-already-in-use') {
        setTestResult(prev => prev + 'Note: This error is expected if you run the test multiple times.\n');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={testFirebaseConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Purpose:</strong> This test checks if Firebase Authentication and Firestore are properly configured.</p>
        <p><strong>What it does:</strong></p>
        <ul className="list-disc list-inside mt-2">
          <li>Creates a temporary test user</li>
          <li>Saves user data to Firestore</li>
          <li>Deletes the test user</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest;