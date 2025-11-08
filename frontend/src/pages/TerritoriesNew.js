import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { territoryAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Plus, MapPin, Share2, TrendingUp } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LocationSelector = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      onLocationSelect({ lat, lng });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

export const TerritoriesNew = () => {
  const [territories, setTerritories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    zone: '',
    center: { lat: 28.6139, lng: 77.2090 },
    radius: 3000,
    metrics: {
      investments: 0,
      buildings: 0,
      populationDensity: 0,
      qualityOfProject: 0,
      govtInfra: 0,
      livabilityIndex: 0,
      airPollutionIndex: 0,
      roads: 0,
      crimeRate: 0
    }
  });

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: 'social',
    location: { lat: 28.6139, lng: 77.2090 },
    socialShare: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [territoriesRes, eventsRes] = await Promise.all([
        territoryAPI.getAll(),
        axios.get(`${BACKEND_URL}/api/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setTerritories(territoriesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerritory = async (e) => {
    e.preventDefault();
    try {
      await territoryAPI.create(formData);
      toast.success('Territory created with 3km radius!');
      setShowCreateDialog(false);
      setIsSelectingLocation(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create territory');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!selectedTerritory) {
      toast.error('Please select a territory first');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/events`,
        { ...eventData, territoryId: selectedTerritory.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Event pin created!');
      setShowEventDialog(false);
      setIsSelectingLocation(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleCreateShareLink = async (territory) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/share-links`,
        null,
        {
          params: { territory_id: territory.id },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      const fullUrl = `${window.location.origin}/share/${response.data.shareToken}`;
      setShareLink(fullUrl);
      setSelectedTerritory(territory);
      setShowShareDialog(true);
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  const getCircleColor = (appreciation) => {
    if (appreciation > 15) return '#22c55e';
    if (appreciation > 10) return '#eab308';
    if (appreciation > 5) return '#f97316';
    return '#ef4444';
  };

  const eventIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-full flex flex-col" data-testid="territories-page">
      <div className="p-6 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Territory Map (3km Radius)</h1>
            <p className="text-muted-foreground mt-1">Click map to select location | Circle = 3km geo-fence</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsSelectingLocation(!isSelectingLocation);
                setShowEventDialog(true);
              }}
              variant="outline"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add Event Pin
            </Button>
            <Button onClick={() => {
              setIsSelectingLocation(!isSelectingLocation);
              setShowCreateDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Territory
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-muted-foreground">Loading map...</div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Location Selector */}
            {isSelectingLocation && (
              <LocationSelector
                onLocationSelect={(loc) => {
                  if (showCreateDialog) {
                    setFormData({ ...formData, center: loc });
                  } else if (showEventDialog) {
                    setEventData({ ...eventData, location: loc });
                  }
                }}
              />
            )}

            {/* Territory Circles */}
            {territories.map((territory) => (
              <Circle
                key={territory.id}
                center={[territory.center.lat, territory.center.lng]}
                radius={territory.radius}
                pathOptions={{
                  color: getCircleColor(territory.aiInsights?.appreciationPercent || 0),
                  fillColor: getCircleColor(territory.aiInsights?.appreciationPercent || 0),
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-bold text-lg mb-2">{territory.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {territory.city} - {territory.zone}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Appreciation:</span>
                        <span className="font-bold text-green-600">
                          {territory.aiInsights?.appreciationPercent || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Radius:</span>
                        <span className="font-bold">{territory.radius / 1000}km</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleCreateShareLink(territory)}
                    >
                      <Share2 className="w-3 h-3 mr-2" />
                      Share Link
                    </Button>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Event Pins */}
            {events.map((event) => (
              <Marker
                key={event.id}
                position={[event.location.lat, event.location.lng]}
                icon={eventIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold">{event.title}</h4>
                    <p className="text-sm">{event.description}</p>
                    <span className="text-xs text-gray-500">{event.category}</span>
                    {event.socialShare && (
                      <div className="mt-2 text-xs text-blue-600">📱 Shared on social media</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 z-[1000]">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-sm">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                <span className="text-xs">&gt;15% High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                <span className="text-xs">10-15% Good</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-xs">Event Pins</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Territory Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Territory (3km Radius)</DialogTitle>
            <DialogDescription>
              Click on map to select center location
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTerritory} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Zone</Label>
              <Input
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input type="number" step="any" value={formData.center.lat} readOnly />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input type="number" step="any" value={formData.center.lng} readOnly />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event Pin</DialogTitle>
            <DialogDescription>Click on map to select location</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full rounded-md border p-2"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full rounded-md border p-2"
                value={eventData.category}
                onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
              >
                <option value="social">Social Media</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="event">Event</option>
                <option value="issue">Issue</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Event</Button>
              <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Territory Link</DialogTitle>
            <DialogDescription>
              Share this link on your WiFi network for live data gathering
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button onClick={copyShareLink}>
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can submit data for {selectedTerritory?.name}.
              All submissions will be visible in real-time.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};