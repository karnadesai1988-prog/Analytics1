import React, { useEffect, useState } from 'react';
import { territoryAPI, metricsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const Analytics = () => {
  const [territories, setTerritories] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTerritories();
  }, []);

  useEffect(() => {
    if (selectedTerritory) {
      loadHistory();
    }
  }, [selectedTerritory]);

  const loadTerritories = async () => {
    try {
      const response = await territoryAPI.getAll();
      setTerritories(response.data);
      if (response.data.length > 0) {
        setSelectedTerritory(response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load territories');
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await metricsAPI.getHistory(selectedTerritory);
      const formattedData = response.data.map(entry => ({
        ...entry,
        date: new Date(entry.timestamp).toLocaleDateString()
      }));
      setHistory(formattedData);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedTerritoryData = territories.find(t => t.id === selectedTerritory);

  return (
    <div className="p-6 space-y-6" data-testid="analytics-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">Historical trends and predictive analytics</p>
        </div>
        <div className="w-64">
          <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
            <SelectTrigger data-testid="analytics-territory-select">
              <SelectValue placeholder="Select territory" />
            </SelectTrigger>
            <SelectContent>
              {territories.map((territory) => (
                <SelectItem key={territory.id} value={territory.id}>
                  {territory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTerritoryData && (
        <>
          {/* AI Insights Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Price Appreciation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        {selectedTerritoryData.aiInsights?.appreciationPercent || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Predicted growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Demand Pressure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {selectedTerritoryData.aiInsights?.demandPressure || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Market demand</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-3xl font-bold mb-2">
                      {((selectedTerritoryData.aiInsights?.confidenceScore || 0) * 100).toFixed(0)}%
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(selectedTerritoryData.aiInsights?.confidenceScore || 0) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Prediction reliability</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appreciation Trend</CardTitle>
                <CardDescription>Historical price appreciation over time</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="aiInsights.appreciationPercent"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Appreciation %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No historical data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Current territory metrics overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Livability', value: selectedTerritoryData.metrics?.livabilityIndex || 0 },
                      { name: 'Infrastructure', value: selectedTerritoryData.metrics?.govtInfra || 0 },
                      { name: 'Quality', value: selectedTerritoryData.metrics?.qualityOfProject || 0 },
                      { name: 'Roads', value: selectedTerritoryData.metrics?.roads || 0 },
                      { name: 'Pollution', value: selectedTerritoryData.metrics?.airPollutionIndex || 0 },
                      { name: 'Crime', value: selectedTerritoryData.metrics?.crimeRate || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Territory Metrics</CardTitle>
              <CardDescription>Comprehensive breakdown of all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Economic Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investments:</span>
                      <span className="font-medium">₹{(selectedTerritoryData.metrics?.investments || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buildings:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.buildings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Population Density:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.populationDensity || 0}/sq.km</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Quality Indicators</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livability Index:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.livabilityIndex || 0}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Project Quality:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.qualityOfProject || 0}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Govt Infrastructure:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.govtInfra || 0}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roads Quality:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.roads || 0}/10</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Risk Factors</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Air Pollution:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.airPollutionIndex || 0}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crime Rate:</span>
                      <span className="font-medium">{selectedTerritoryData.metrics?.crimeRate || 0}/10</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Restrictions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rent (Family Only):</span>
                      <span className="font-medium">
                        {selectedTerritoryData.restrictions?.rentFamilyOnly ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PG Allowed:</span>
                      <span className="font-medium">
                        {selectedTerritoryData.restrictions?.pgAllowed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedTerritory && (
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center text-muted-foreground">
              <p>Select a territory to view analytics</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};