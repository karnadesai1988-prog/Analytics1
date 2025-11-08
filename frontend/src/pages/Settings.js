import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Key, Save } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/auth/config-api-key`,
        { openai_api_key: apiKey },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('OpenAI API key configured successfully!');
      setApiKey('');
    } catch (error) {
      toast.error('Failed to save API key');
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

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              OpenAI API Configuration
            </CardTitle>
            <CardDescription>
              Configure your OpenAI API key for AI-powered comment validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is encrypted and stored securely. Get your key from{' '}
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

              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save API Key'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">How it works:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>API key is optional - basic regex validation works without it</li>
                <li>Enable "AI Validation" toggle when posting comments</li>
                <li>Uses GPT-4o-mini for cost-effective content moderation</li>
                <li>More accurate spam and abuse detection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Deployment Information</CardTitle>
            <CardDescription>This instance is fully independent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend:</span>
                <span className="font-mono">{BACKEND_URL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database:</span>
                <span>MongoDB (Local/Cloud)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dependencies:</span>
                <span className="text-green-600">None (Emergent-free)</span>
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