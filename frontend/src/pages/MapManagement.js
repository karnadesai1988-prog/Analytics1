import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { MapPin, Plus, Target, Search, Layers, Tag } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import './MapManagement.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Custom Pin Icons
const pinIcons = {
  job: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  supplier: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  vendor: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  shop: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

// Location Picker Component
const LocationPicker = ({ onLocationSelect, mode }) => {
  const [marker, setMarker] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarker({ lat, lng });
      onLocationSelect({ lat, lng });
    },
  });

  return marker ? (
    <Marker position={[marker.lat, marker.lng]}>
      <Popup>
        <div className="text-sm">
          <strong>Selected Location</strong><br />
          Lat: {marker.lat.toFixed(6)}<br />
          Lng: {marker.lng.toFixed(6)}
        </div>
      </Popup>
    </Marker>
  ) : null;
};

export const MapManagement = () => {
  const [territories, setTerritories] = useState([]);
  const [pins, setPins] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  
  // Dialog states
  const [showTerritoryDialog, setShowTerritoryDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  
  // Mode states
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [currentMode, setCurrentMode] = useState(null); // 'territory', 'pin', 'project', 'event'
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Territory Form
  const [territoryForm, setTerritoryForm] = useState({
    name: '',
    city: '',
    zone: '',
    center: { lat: 28.6139, lng: 77.2090 },
    radius: 5000,
  });

  // Pin Form
  const [pinForm, setPinForm] = useState({
    location: { lat: 28.6139, lng: 77.2090 },
    type: [],
    label: '',
    description: '',
    address: '',
    territoryId: '',
    projectId: '',
  });

  // Project Form
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    location: { lat: 28.6139, lng: 77.2090 },
    territoryId: '',
    status: 'active',
  });

  // Event Form
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: { lat: 28.6139, lng: 77.2090 },
    territoryId: '',
    category: 'social',
    eventDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [territoriesRes, pinsRes, projectsRes, eventsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/territories`, { headers }),
        axios.get(`${BACKEND_URL}/api/pins`, { headers }),
        axios.get(`${BACKEND_URL}/api/projects`, { headers }),
        axios.get(`${BACKEND_URL}/api/events`, { headers }),
      ]);
      
      setTerritories(territoriesRes.data);
      setPins(pinsRes.data);
      setProjects(projectsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Failed to load map data');
    }
  };

  const handleLocationPicked = (location) => {
    setSelectedLocation(location);
    
    if (currentMode === 'territory') {
      setTerritoryForm({ ...territoryForm, center: location });
    } else if (currentMode === 'pin') {
      setPinForm({ ...pinForm, location });
    } else if (currentMode === 'project') {
      setProjectForm({ ...projectForm, location });
    } else if (currentMode === 'event') {
      setEventForm({ ...eventForm, location });
    }
  };

  const startLocationPicking = (mode) => {
    setCurrentMode(mode);
    setIsPickingLocation(true);
    toast.info('Click on map to select location');
  };

  // Territory Creation
  const handleCreateTerritory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/territories`,
        {
          ...territoryForm,
          metrics: {
            investments: 0,
            buildings: 0,
            populationDensity: 0,
            qualityOfProject: 0,
            govtInfra: 0,
            livabilityIndex: 0,
            airPollutionIndex: 0,
            roads: 0,
            crimeRate: 0,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Territory created with 5km geofence!');
      setShowTerritoryDialog(false);
      setIsPickingLocation(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create territory');
    }
  };

  // Pin Creation
  const handleCreatePin = async (e) => {
    e.preventDefault();
    if (pinForm.type.length === 0) {
      toast.error('Please select at least one pin type');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/pins`,
        pinForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Pin created successfully!');
      setShowPinDialog(false);
      setIsPickingLocation(false);
      setPinForm({
        location: { lat: 28.6139, lng: 77.2090 },
        type: [],
        label: '',
        description: '',
        address: '',
        territoryId: '',
        projectId: '',
      });
      loadData();
    } catch (error) {
      toast.error('Failed to create pin');
    }
  };

  // Project Creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/projects`,
        projectForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Project created successfully!');
      setShowProjectDialog(false);
      setIsPickingLocation(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  // Event Creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/events`,
        {
          ...eventForm,
          eventDate: new Date(eventForm.eventDate).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Event created successfully!');
      setShowEventDialog(false);
      setIsPickingLocation(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handlePinTypeToggle = (type) => {
    setPinForm(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const getCircleColor = (appreciation) => {
    if (appreciation > 15) return '#ff6b35';
    if (appreciation > 10) return '#ff8c42';
    if (appreciation > 5) return '#ffad60';
    return '#ffd07b';
  };

  return (
    <div className="map-management-page\" data-testid=\"map-management-page\">
      {/* Glassmorphism Header */}
      <div className=\"glass-header\">
        <div className=\"flex items-center justify-between\">
          <div>
            <h1 className=\"text-3xl font-bold text-gray-800\">Territory & Map Management</h1>
            <p className=\"text-gray-600 mt-1\">Place picker • 5km Geofencing • Advanced Pinning</p>
          </div>
          
          <div className=\"flex gap-2\">
            <Button
              onClick={() => {
                startLocationPicking('territory');
                setShowTerritoryDialog(true);
              }}
              className=\"glass-button\"
            >
              <Target className=\"w-4 h-4 mr-2\" />
              Create Territory
            </Button>
            
            <Button
              onClick={() => {
                startLocationPicking('pin');
                setShowPinDialog(true);
              }}
              className=\"glass-button-orange\"
            >
              <MapPin className=\"w-4 h-4 mr-2\" />
              Add Pin
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className=\"mt-4\">
          <div className=\"relative\">
            <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400\" />
            <Input
              placeholder=\"Search by address or coordinates (lat, lng)...\"
              className=\"pl-10 glass-input\"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className=\"map-container\">
        <MapContainer
          center={mapCenter}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className=\"rounded-lg\"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"
          />
          
          {/* Location Picker */}
          {isPickingLocation && (
            <LocationPicker
              onLocationSelect={handleLocationPicked}
              mode={currentMode}
            />
          )}

          {/* Territory Circles with Glassmorphism */}
          {territories.map((territory) => (
            <Circle
              key={territory.id}
              center={[territory.center.lat, territory.center.lng]}
              radius={territory.radius}
              pathOptions={{
                color: '#ff6b35',
                fillColor: '#ff6b35',
                fillOpacity: 0.15,
                weight: 3,
                dashArray: '10, 10',
              }}
            >
              <Popup>
                <div className=\"p-3 min-w-[280px]\">
                  <h3 className=\"font-bold text-lg mb-2 text-orange-600\">{territory.name}</h3>
                  <p className=\"text-sm text-gray-600 mb-3\">
                    {territory.city} - {territory.zone}
                  </p>
                  <div className=\"space-y-2 text-sm\">
                    <div className=\"flex justify-between\">
                      <span className=\"text-gray-600\">Geofence:</span>
                      <span className=\"font-semibold\">{territory.radius / 1000}km radius</span>
                    </div>
                    <div className=\"flex justify-between\">
                      <span className=\"text-gray-600\">Appreciation:</span>
                      <span className=\"font-semibold text-green-600\">
                        {territory.aiInsights?.appreciationPercent || 0}%
                      </span>
                    </div>
                    <div className=\"flex justify-between\">
                      <span className=\"text-gray-600\">Coordinates:</span>
                      <span className=\"font-mono text-xs\">
                        {territory.center.lat.toFixed(4)}, {territory.center.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Pins */}
          {pins.map((pin) => {
            const primaryType = pin.type[0] || 'job';
            return (
              <Marker
                key={pin.id}
                position={[pin.location.lat, pin.location.lng]}
                icon={pinIcons[primaryType]}
              >
                <Popup>
                  <div className=\"p-3\">
                    <h4 className=\"font-bold mb-1\">{pin.label}</h4>
                    <div className=\"flex flex-wrap gap-1 mb-2\">
                      {pin.type.map(t => (
                        <span key={t} className=\"text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded\">
                          {t}
                        </span>
                      ))}
                    </div>
                    {pin.description && <p className=\"text-sm text-gray-600 mb-2\">{pin.description}</p>}
                    {pin.address && <p className=\"text-xs text-gray-500\">{pin.address}</p>}
                    <p className=\"text-xs text-gray-400 mt-2\">By: {pin.userName}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Glassmorphism Legend */}
        <Card className=\"glass-legend\">
          <CardContent className=\"p-4\">
            <h4 className=\"font-semibold mb-3 flex items-center gap-2\">
              <Layers className=\"w-4 h-4\" />
              Map Legend
            </h4>
            <div className=\"space-y-2 text-sm\">
              <div className=\"flex items-center gap-2\">
                <div className=\"w-4 h-4 rounded-full border-2\" style={{ borderColor: '#ff6b35' }}></div>
                <span>5km Geofence</span>
              </div>
              <div className=\"flex items-center gap-2\">
                <MapPin className=\"w-4 h-4 text-blue-600\" />
                <span>Job</span>
              </div>
              <div className=\"flex items-center gap-2\">
                <MapPin className=\"w-4 h-4 text-green-600\" />
                <span>Supplier</span>
              </div>
              <div className=\"flex items-center gap-2\">
                <MapPin className=\"w-4 h-4 text-orange-600\" />
                <span>Vendor</span>
              </div>
              <div className=\"flex items-center gap-2\">
                <MapPin className=\"w-4 h-4 text-red-600\" />
                <span>Shop</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Territory Dialog */}
      <Dialog open={showTerritoryDialog} onOpenChange={setShowTerritoryDialog}>
        <DialogContent className=\"glass-dialog\">
          <DialogHeader>
            <DialogTitle>Create Territory with 5km Geofence</DialogTitle>
            <DialogDescription>
              Click on map to select exact center coordinates
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTerritory} className=\"space-y-4\">
            <div className=\"grid grid-cols-2 gap-4\">
              <div>
                <Label>Territory Name</Label>
                <Input
                  value={territoryForm.name}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={territoryForm.city}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, city: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label>Zone</Label>
              <Input
                value={territoryForm.zone}
                onChange={(e) => setTerritoryForm({ ...territoryForm, zone: e.target.value })}
                required
              />
            </div>
            
            <div className=\"grid grid-cols-2 gap-4\">
              <div>
                <Label>Latitude</Label>
                <Input
                  type=\"number\"
                  step=\"any\"
                  value={territoryForm.center.lat}
                  onChange={(e) => setTerritoryForm({
                    ...territoryForm,
                    center: { ...territoryForm.center, lat: parseFloat(e.target.value) || 0 }
                  })}
                  required
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type=\"number\"
                  step=\"any\"
                  value={territoryForm.center.lng}
                  onChange={(e) => setTerritoryForm({
                    ...territoryForm,
                    center: { ...territoryForm.center, lng: parseFloat(e.target.value) || 0 }
                  })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label>Radius (meters) - Default 5km</Label>
              <Input
                type=\"number\"
                value={territoryForm.radius}
                onChange={(e) => setTerritoryForm({ ...territoryForm, radius: parseInt(e.target.value) || 5000 })}
              />
            </div>
            
            <div className=\"flex gap-2\">
              <Button type=\"submit\" className=\"glass-button-orange\">Create Territory</Button>
              <Button
                type=\"button\"
                variant=\"outline\"
                onClick={() => {
                  setShowTerritoryDialog(false);
                  setIsPickingLocation(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pin Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className=\"glass-dialog max-h-[90vh] overflow-y-auto\">
          <DialogHeader>
            <DialogTitle className=\"flex items-center gap-2\">
              <Tag className=\"w-5 h-5\" />
              Create Pin with Multiple Types
            </DialogTitle>
            <DialogDescription>
              Click map to select location • Multi-select pin types
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePin} className=\"space-y-4\">
            <div>
              <Label>Pin Label *</Label>
              <Input
                value={pinForm.label}
                onChange={(e) => setPinForm({ ...pinForm, label: e.target.value })}
                placeholder=\"e.g., ABC Steel Supplier\"
                required
              />
            </div>
            
            <div>
              <Label>Pin Types (Select multiple) *</Label>
              <div className=\"grid grid-cols-2 gap-3 mt-2\">
                {['job', 'supplier', 'vendor', 'shop'].map(type => (
                  <div key={type} className=\"flex items-center gap-2\">
                    <Checkbox
                      checked={pinForm.type.includes(type)}
                      onCheckedChange={() => handlePinTypeToggle(type)}
                    />
                    <label className=\"capitalize cursor-pointer\">{type}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <textarea
                className=\"w-full min-h-[80px] rounded-md border p-2\"
                value={pinForm.description}
                onChange={(e) => setPinForm({ ...pinForm, description: e.target.value })}
                placeholder=\"Additional details about this location...\"
              />
            </div>
            
            <div>
              <Label>Address (Optional)</Label>
              <Input
                value={pinForm.address}
                onChange={(e) => setPinForm({ ...pinForm, address: e.target.value })}
                placeholder=\"Full address\"
              />
            </div>
            
            <div className=\"grid grid-cols-2 gap-4\">
              <div>
                <Label>Latitude *</Label>
                <Input
                  type=\"number\"
                  step=\"any\"
                  value={pinForm.location.lat}
                  onChange={(e) => setPinForm({
                    ...pinForm,
                    location: { ...pinForm.location, lat: parseFloat(e.target.value) || 0 }
                  })}
                  required
                />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input
                  type=\"number\"
                  step=\"any\"
                  value={pinForm.location.lng}
                  onChange={(e) => setPinForm({
                    ...pinForm,
                    location: { ...pinForm.location, lng: parseFloat(e.target.value) || 0 }
                  })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label>Link to Territory (Optional)</Label>
              <Select
                value={pinForm.territoryId}
                onValueChange={(value) => setPinForm({ ...pinForm, territoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder=\"Select territory\" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"\">None</SelectItem>
                  {territories.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className=\"flex gap-2\">
              <Button type=\"submit\" className=\"glass-button-orange\">Create Pin</Button>
              <Button
                type=\"button\"
                variant=\"outline\"
                onClick={() => {
                  setShowPinDialog(false);
                  setIsPickingLocation(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};"