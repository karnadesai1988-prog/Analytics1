import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { MapPin, Plus, Target, Search, Layers } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import './MapManagement.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const AHMEDABAD_CENTER = [23.0225, 72.5714];

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
  office: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  warehouse: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  service_center: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  event_venue: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  project_site: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  residential_area: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  parking_logistics: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  landmark: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

const PIN_TYPES = [
  { value: 'job', label: 'Job', color: 'blue' },
  { value: 'supplier', label: 'Supplier', color: 'green' },
  { value: 'vendor', label: 'Vendor', color: 'orange' },
  { value: 'shop', label: 'Shop', color: 'red' },
  { value: 'office', label: 'Office', color: 'violet' },
  { value: 'warehouse', label: 'Warehouse', color: 'grey' },
  { value: 'service_center', label: 'Service Center', color: 'yellow' },
  { value: 'event_venue', label: 'Event Venue', color: 'red' },
  { value: 'project_site', label: 'Project Site', color: 'orange' },
  { value: 'residential_area', label: 'Residential Area', color: 'blue' },
  { value: 'parking_logistics', label: 'Parking / Logistics Hub', color: 'grey' },
  { value: 'landmark', label: 'Landmark / Attraction', color: 'gold' },
];

const LocationPicker = ({ onLocationSelect }) => {
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
  const [mapCenter, setMapCenter] = useState(AHMEDABAD_CENTER);
  const [showTerritoryDialog, setShowTerritoryDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [territoryForm, setTerritoryForm] = useState({
    name: '',
    city: 'Ahmedabad',
    zone: '',
    center: { lat: 23.0225, lng: 72.5714 },
    radius: 5000,
  });

  const [pinForm, setPinForm] = useState({
    location: { lat: 23.0225, lng: 72.5714 },
    type: [],
    label: '',
    description: '',
    address: '',
    hasGeofence: false,
    geofenceRadius: 1000,
    territoryId: '',
    generateAIInsights: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [territoriesRes, pinsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/territories`, { headers }),
        axios.get(`${BACKEND_URL}/api/pins`, { headers }),
      ]);
      
      setTerritories(territoriesRes.data);
      setPins(pinsRes.data);
    } catch (error) {
      toast.error('Failed to load map data');
    }
  };

  const handleLocationPicked = (location) => {
    if (currentMode === 'territory') {
      setTerritoryForm({ ...territoryForm, center: location });
    } else if (currentMode === 'pin') {
      setPinForm({ ...pinForm, location });
    }
  };

  const startLocationPicking = (mode) => {
    setCurrentMode(mode);
    setIsPickingLocation(true);
    toast.info('Click on map to select location');
  };

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
      toast.error(error.response?.data?.detail || 'Failed to create territory');
    }
  };

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
        location: { lat: 23.0225, lng: 72.5714 },
        type: [],
        label: '',
        description: '',
        address: '',
        hasGeofence: false,
        geofenceRadius: 1000,
        territoryId: '',
        generateAIInsights: false,
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create pin');
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

  return (
    <div className="map-management-page" data-testid="map-management-page">
      <div className="glass-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ahmedabad Territory Map</h1>
            <p className="text-gray-600 mt-1">Place picker • 5km Geofencing • 12 Pin Types • AI Insights</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                startLocationPicking('territory');
                setShowTerritoryDialog(true);
              }}
              className="glass-button"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Territory
            </Button>
            
            <Button
              onClick={() => {
                startLocationPicking('pin');
                setShowPinDialog(true);
              }}
              className="glass-button-orange"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Add Pin
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by address or coordinates..."
              className="pl-10 glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {isPickingLocation && (
            <LocationPicker onLocationSelect={handleLocationPicked} />
          )}

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
                <div className="p-3 min-w-[280px]">
                  <h3 className="font-bold text-lg mb-2 text-orange-600">{territory.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {territory.city} - {territory.zone}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Geofence:</span>
                      <span className="font-semibold">{territory.radius / 1000}km radius</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appreciation:</span>
                      <span className="font-semibold text-green-600">
                        {territory.aiInsights?.appreciationPercent || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {pins.map((pin) => {
            const primaryType = pin.type[0] || 'job';
            return (
              <React.Fragment key={pin.id}>
                <Marker
                  position={[pin.location.lat, pin.location.lng]}
                  icon={pinIcons[primaryType] || pinIcons.job}
                >
                  <Popup>
                    <div className="p-3 max-w-[300px]">
                      <h4 className="font-bold mb-1">{pin.label}</h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pin.type.map(t => {
                          const typeInfo = PIN_TYPES.find(pt => pt.value === t);
                          return (
                            <span key={t} className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                              {typeInfo?.label || t}
                            </span>
                          );
                        })}
                      </div>
                      {pin.description && <p className="text-sm text-gray-600 mb-2">{pin.description}</p>}
                      {pin.hasGeofence && (
                        <p className="text-xs text-blue-600 font-semibold">🔵 Geofence: {pin.geofenceRadius}m</p>
                      )}
                      {pin.aiInsights && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-semibold text-purple-600">🤖 AI Insights Available</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
                {pin.hasGeofence && (
                  <Circle
                    center={[pin.location.lat, pin.location.lng]}
                    radius={pin.geofenceRadius}
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.1,
                      weight: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        <Card className="glass-legend">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              12 Pin Types
            </h4>
            <div className="space-y-2 text-xs max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-orange-500"></div>
                <span>Territory (5km)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500"></div>
                <span>Pin Geofence</span>
              </div>
              {PIN_TYPES.map(type => (
                <div key={type.value} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${type.color}-600`}></div>
                  <span>{type.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTerritoryDialog} onOpenChange={setShowTerritoryDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle>Create Territory (5km Geofence)</DialogTitle>
            <DialogDescription>
              Click on map to select center coordinates for Ahmedabad
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTerritory} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={territoryForm.name}
                  onChange={(e) => setTerritoryForm({ ...territoryForm, name: e.target.value })}
                  placeholder="e.g., Vastrapur"
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
                placeholder="e.g., West Ahmedabad"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={territoryForm.center.lat}
                  onChange={(e) => setTerritoryForm({
                    ...territoryForm,
                    center: { ...territoryForm.center, lat: parseFloat(e.target.value) || 23.0225 }
                  })}
                  required
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={territoryForm.center.lng}
                  onChange={(e) => setTerritoryForm({
                    ...territoryForm,
                    center: { ...territoryForm.center, lng: parseFloat(e.target.value) || 72.5714 }
                  })}
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="glass-button-orange">Create Territory</Button>
              <Button
                type="button"
                variant="outline"
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

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="glass-dialog max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Pin with 12 Types & Geofence</DialogTitle>
            <DialogDescription>
              Click map to select location in Ahmedabad • Multi-select pin types
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePin} className="space-y-4">
            <div>
              <Label>Pin Label *</Label>
              <Input
                value={pinForm.label}
                onChange={(e) => setPinForm({ ...pinForm, label: e.target.value })}
                placeholder="e.g., ABC Steel Supplier"
                required
              />
            </div>
            
            <div>
              <Label className="mb-3 block">Pin Types (Select multiple) *</Label>
              <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto p-2 border rounded">
                {PIN_TYPES.map(type => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={pinForm.type.includes(type.value)}
                      onCheckedChange={() => handlePinTypeToggle(type.value)}
                    />
                    <label className="text-sm cursor-pointer">{type.label}</label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{pinForm.type.length} type(s) selected</p>
            </div>
            
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border p-2"
                value={pinForm.description}
                onChange={(e) => setPinForm({ ...pinForm, description: e.target.value })}
                placeholder="Additional details..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude *</Label>
                <Input
                  type="number"
                  step="any"
                  value={pinForm.location.lat}
                  onChange={(e) => setPinForm({
                    ...pinForm,
                    location: { ...pinForm.location, lat: parseFloat(e.target.value) || 23.0225 }
                  })}
                  required
                />
              </div>
              <div>
                <Label>Longitude *</Label>
                <Input
                  type="number"
                  step="any"
                  value={pinForm.location.lng}
                  onChange={(e) => setPinForm({
                    ...pinForm,
                    location: { ...pinForm.location, lng: parseFloat(e.target.value) || 72.5714 }
                  })}
                  required
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>🔵 Enable Geofence for This Pin</Label>
                <Checkbox
                  checked={pinForm.hasGeofence}
                  onCheckedChange={(checked) => setPinForm({ ...pinForm, hasGeofence: checked })}
                />
              </div>
              
              {pinForm.hasGeofence && (
                <div>
                  <Label>Geofence Radius (meters)</Label>
                  <Input
                    type="number"
                    value={pinForm.geofenceRadius}
                    onChange={(e) => setPinForm({ ...pinForm, geofenceRadius: parseInt(e.target.value) || 1000 })}
                    placeholder="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 1000m (1km) • Creates blue circular geofence</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>🤖 Generate AI Insights</Label>
                <Checkbox
                  checked={pinForm.generateAIInsights}
                  onCheckedChange={(checked) => setPinForm({ ...pinForm, generateAIInsights: checked })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Get strategic recommendations & risk analysis (requires API key)</p>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="glass-button-orange">Create Pin</Button>
              <Button
                type="button"
                variant="outline"
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
};