import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Zap, Clock, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const App = () => {
  return (
    <div className="bg-purple-900 min-h-screen text-purple-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-200">Earthquake Dashboard</h1>
      <EarthquakeDashboard />
    </div>
  );
};

const EarthquakeDashboard = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [autoGempa, setAutoGempa] = useState(null);
  const [latestEarthquakes, setLatestEarthquakes] = useState([]);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);

  useEffect(() => {
    if (activeTab === 'felt') {
      fetchEarthquakeData();
    } else if (activeTab === 'auto') {
      fetchAutoGempa();
    } else if (activeTab === 'latest') {
      fetchLatestEarthquakes();
    }
  }, [activeTab]);

  const fetchEarthquakeData = async () => {
    try {
      const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
      const data = await response.json();
      setEarthquakeData(data.Infogempa.gempa);
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
    }
  };

  const fetchAutoGempa = async () => {
    try {
      const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
      const data = await response.json();
      setAutoGempa(data.Infogempa.gempa);
    } catch (error) {
      console.error('Error fetching auto gempa data:', error);
    }
  };

  const fetchLatestEarthquakes = async () => {
    try {
      const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
      const data = await response.json();
      setLatestEarthquakes(data.Infogempa.gempa);
    } catch (error) {
      console.error('Error fetching latest earthquakes data:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        <div className="bg-purple-800 rounded-lg p-4 shadow-lg">
          {activeTab === 'latest' && <LatestEarthquakes earthquakes={latestEarthquakes} setSelectedEarthquake={setSelectedEarthquake} />}
          {activeTab === 'felt' && <FeltEarthquakes earthquakes={earthquakeData} setSelectedEarthquake={setSelectedEarthquake} />}
          {activeTab === 'auto' && <AutoGempa gempa={autoGempa} setSelectedEarthquake={setSelectedEarthquake} />}
        </div>
        <div className="bg-purple-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-purple-200">Earthquake Map</h2>
          <EarthquakeMap selectedEarthquake={selectedEarthquake} />
        </div>
      </div>
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const LatestEarthquakes = ({ earthquakes, setSelectedEarthquake }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 text-purple-200">Latest Earthquakes</h2>
    <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {earthquakes.map((quake, index) => (
        <EarthquakeCard key={index} quake={quake} setSelectedEarthquake={setSelectedEarthquake} />
      ))}
    </div>
  </div>
);

const FeltEarthquakes = ({ earthquakes, setSelectedEarthquake }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 text-purple-200">Felt Earthquakes</h2>
    <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {earthquakes.map((quake, index) => (
        <EarthquakeCard key={index} quake={quake} setSelectedEarthquake={setSelectedEarthquake} />
      ))}
    </div>
  </div>
);

const AutoGempa = ({ gempa, setSelectedEarthquake }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 text-purple-200">Auto Gempa</h2>
    {gempa ? (
      <EarthquakeCard quake={gempa} setSelectedEarthquake={setSelectedEarthquake} />
    ) : (
      <p>Loading auto gempa data...</p>
    )}
  </div>
);

const EarthquakeCard = ({ quake, setSelectedEarthquake }) => (
  <div
    className="bg-purple-700 rounded-lg p-4 shadow-lg cursor-pointer transition-all hover:bg-purple-600"
    onClick={() => setSelectedEarthquake(quake)}
  >
    <h3 className="text-xl font-semibold mb-2 text-purple-200">{quake.Wilayah}</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <p><strong>Magnitude:</strong> {quake.Magnitude}</p>
      <p><strong>Depth:</strong> {quake.Kedalaman}</p>
      <p><strong>Date:</strong> {quake.Tanggal}</p>
      <p><strong>Time:</strong> {quake.Jam}</p>
      <p><strong>Coordinates:</strong> {quake.Coordinates}</p>
      <p><strong>Potensi:</strong> {quake.Potensi}</p>
    </div>
    {quake.Dirasakan && (
      <p className="mt-2 text-yellow-300"><strong>Felt:</strong> {quake.Dirasakan}</p>
    )}
  </div>
);

const EarthquakeMap = ({ selectedEarthquake }) => {
  if (!selectedEarthquake) {
    return <div className="h-[400px] flex items-center justify-center bg-purple-700 rounded-lg">Select an earthquake to view on the map</div>;
  }

  const [lat, lng] = selectedEarthquake.Coordinates.split(',').map(Number);

  return (
    <MapContainer center={[lat, lng]} zoom={6} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <div>
            <h3 className="font-semibold">{selectedEarthquake.Wilayah}</h3>
            <p>Magnitude: {selectedEarthquake.Magnitude}</p>
            <p>Depth: {selectedEarthquake.Kedalaman}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

const BottomNavigation = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-purple-800 p-4">
    <div className="flex justify-around max-w-4xl mx-auto">
      <NavButton
        icon={<Clock />}
        label="Latest"
        isActive={activeTab === 'latest'}
        onClick={() => setActiveTab('latest')}
      />
      <NavButton
        icon={<Activity />}
        label="Felt"
        isActive={activeTab === 'felt'}
        onClick={() => setActiveTab('felt')}
      />
      <NavButton
        icon={<Zap />}
        label="Auto"
        isActive={activeTab === 'auto'}
        onClick={() => setActiveTab('auto')}
      />
    </div>
  </div>
);

const NavButton = ({ icon, label, isActive, onClick }) => (
  <button
    className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
      isActive ? 'text-yellow-300' : 'text-purple-300 hover:text-purple-100'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

export default App;