import React, { useEffect, useState } from 'react';
import { territoryAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { MapPin, TrendingUp, Building, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export const Dashboard = () => {
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTerritories: 0,
    avgAppreciation: 0,
    totalInvestments: 0,
    totalBuildings: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await territoryAPI.getAll();
      const data = response.data;
      setTerritories(data);

      // Calculate stats
      const totalTerritories = data.length;
      const avgAppreciation = data.reduce((sum, t) => sum + (t.aiInsights?.appreciationPercent || 0), 0) / totalTerritories || 0;
      const totalInvestments = data.reduce((sum, t) => sum + (t.metrics?.investments || 0), 0);
      const totalBuildings = data.reduce((sum, t) => sum + (t.metrics?.buildings || 0), 0);

      setStats({
        totalTerritories,
        avgAppreciation: avgAppreciation.toFixed(2),
        totalInvestments,
        totalBuildings
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Territories',
      value: stats.totalTerritories,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Avg Appreciation',
      value: `${stats.avgAppreciation}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: stats.avgAppreciation > 0 ? 'up' : 'down'
    },
    {
      title: 'Total Investments',
      value: formatCurrency(stats.totalInvestments),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Buildings',
      value: formatNumber(stats.totalBuildings),
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Territory insights and analytics overview</p>
        </div>
        <Link to="/territories">
          <Button data-testid="view-territories-button">
            <MapPin className="w-4 h-4 mr-2" />
            View Map
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.trend && (
                        stat.trend === 'up' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Territories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Territories</CardTitle>
          <CardDescription>Territories with highest appreciation potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Territory</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">City</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Zone</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Appreciation</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Confidence</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Investment</th>
                </tr>
              </thead>
              <tbody>
                {territories
                  .sort((a, b) => (b.aiInsights?.appreciationPercent || 0) - (a.aiInsights?.appreciationPercent || 0))
                  .slice(0, 10)
                  .map((territory) => (
                    <tr key={territory.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{territory.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{territory.city}</td>
                      <td className="py-3 px-4 text-muted-foreground">{territory.zone}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {territory.aiInsights?.appreciationPercent || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(territory.aiInsights?.confidenceScore || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {((territory.aiInsights?.confidenceScore || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatCurrency(territory.metrics?.investments || 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {territories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No territories found. Create your first territory to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};