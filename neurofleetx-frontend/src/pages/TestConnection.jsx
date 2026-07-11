import { useState } from 'react';
import API_URL from '../config/api';

function TestConnection() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Test if backend is reachable
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'OPTIONS'
      });
      
      setResult(`✅ Backend is reachable!\n\nAPI URL: ${API_URL}\nStatus: ${response.status}\nCORS: Allowed`);
    } catch (error) {
      setResult(`❌ Backend not reachable!\n\nAPI URL: ${API_URL}\nError: ${error.message}\n\nPossible issues:\n1. Backend is not deployed\n2. CORS not configured\n3. Wrong URL in .env`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@neurofleetx.com',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Login endpoint working!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`⚠️ Login failed\n\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}\n\nTry with:\nadmin@neurofleetx.com / admin123\nmanager@neurofleetx.com / manager123\ndriver@neurofleetx.com / driver123`);
      }
    } catch (error) {
      setResult(`❌ Login request failed!\n\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    setResult('Testing signup...');
    
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'test123',
      gender: 'Male',
      role: 'CUSTOMER',
      phone: '9999999999',
      city: 'Test City',
      aadhar: '123456789012'
    };
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Signup successful!\n\nUser created: ${testUser.email}\nPassword: test123\n\nResponse: ${JSON.stringify(data, null, 2)}\n\nNow try logging in with these credentials!`);
      } else {
        setResult(`❌ Signup failed\n\nStatus: ${response.status}\nError: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Signup request failed!\n\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🔧 Backend Connection Test</h1>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <strong>Current API URL:</strong> {API_URL}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={testBackend}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Test Backend Connection
        </button>
        
        <button 
          onClick={testSignup}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Test Signup
        </button>
        
        <button 
          onClick={testLogin}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          Test Login
        </button>
      </div>
      
      {result && (
        <pre style={{
          padding: '1rem',
          background: '#1e1e1e',
          color: '#fff',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {result}
        </pre>
      )}
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>Troubleshooting Checklist:</h3>
        <ul>
          <li>✓ Check if backend is deployed and running on Render</li>
          <li>✓ Verify VITE_API_URL environment variable in Render: <code>{API_URL}</code></li>
          <li>✓ Ensure backend CORS includes your frontend URL</li>
          <li>✓ Check browser console for CORS errors (F12)</li>
          <li>✓ Verify backend database is connected</li>
          <li>✓ Test backend directly: curl {API_URL}/api/auth/login</li>
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>Default Test Accounts (from SafeDataLoader):</h3>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <div><strong>Admin:</strong> admin@neurofleetx.com / admin123</div>
          <div><strong>Manager:</strong> manager@neurofleetx.com / manager123</div>
          <div><strong>Driver:</strong> driver@neurofleetx.com / driver123</div>
        </div>

        <h3 style={{ marginTop: '1.5rem' }}>If "Invalid credentials" after signup:</h3>
        <ol>
          <li>Click "Test Signup" above - it will create a test account</li>
          <li>If successful, note the email/password shown</li>
          <li>Click "Test Login" to verify login works with test accounts</li>
          <li>Check backend logs in Render for database errors</li>
          <li>Verify your database is accessible from Render</li>
        </ol>
      </div>
    </div>
  );
}

export default TestConnection;
