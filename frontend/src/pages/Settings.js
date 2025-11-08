import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Key, Save, Map, Globe } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [pincodeApiUrl, setPincodeApiUrl] = useState('');
  const [pincodeApiKey, setPincodeApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/config-api-key`,
        {
          openai_api_key: openaiKey || undefined,
          pincode_api_url: pincodeApiUrl || undefined,
          pincode_api_key: pincodeApiKey || undefined,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('API configuration saved successfully!');
      setOpenaiKey('');
      setPincodeApiUrl('');
      setPincodeApiKey('');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your API keys and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              OpenAI API Configuration
            </CardTitle>
            <CardDescription>
              Configure your OpenAI API key for AI-powered features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiKey">OpenAI API Key (Optional)</Label>
                <Input
                  id="openaiKey"
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get your key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Pincode Geofencing API
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="pincodeApiUrl">Pincode API Endpoint URL (Required)</Label>
                    <Input
                      id="pincodeApiUrl"
                      type="url"
                      placeholder="https://api.example.com/pincode"
                      value={pincodeApiUrl}
                      onChange={(e) => setPincodeApiUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This API should accept a 'pincode' parameter and return boundary coordinates
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincodeApiKey">Pincode API Key (Optional)</Label>
                    <Input
                      id="pincodeApiKey"
                      type="password"
                      placeholder="Your API key if required"
                      value={pincodeApiKey}
                      onChange={(e) => setPincodeApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty if your pincode API doesn't require authentication
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Expected Pincode API Response Format:</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`{
  "boundary": [
    [lat1, lng1],
    [lat2, lng2],
    ...
  ],
  "center": {
    "lat": centerLat,
    "lng": centerLng
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Deployment Information
            </CardTitle>
            <CardDescription>This instance is fully independent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend:</span>
                <span className="font-mono text-xs">{BACKEND_URL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database:</span>
                <span>MongoDB (Local/Cloud)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dependencies:</span>
                <span className="text-green-600 font-semibold">None (Platform-Independent)</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ This application can be deployed anywhere - Docker, AWS, Heroku, Digital Ocean, or any VPS.
                See DEPLOYMENT.md for instructions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
