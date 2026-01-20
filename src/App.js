import React, { useState, useEffect, useRef } from 'react';
import { Activity, Hand, Gauge, Download, Calendar, Clock, User } from 'lucide-react';

function App() {
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [fsrValue, setFsrValue] = useState(50);
  const [buttonPresses, setButtonPresses] = useState([]);
  const [tremor, setTremor] = useState(0);
  const [pressure, setPressure] = useState(0);
  const [tapping, setTapping] = useState(0);
  const [patientName, setPatientName] = useState('');
  const reportRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGyroData({
        x: Math.sin(Date.now() / 1000) * 30 + Math.random() * 20,
        y: Math.cos(Date.now() / 1000) * 25 + Math.random() * 15,
        z: Math.sin(Date.now() / 800) * 20 + Math.random() * 10
      });
      
      setFsrValue(50 + Math.random() * 40);
      
      const tremorLevel = Math.sqrt(
        Math.pow(gyroData.x, 2) + 
        Math.pow(gyroData.y, 2) + 
        Math.pow(gyroData.z, 2)
      ) / 100;
      setTremor(Math.min(tremorLevel, 1));
      
      setPressure(fsrValue / 100);
    }, 100);

    return () => clearInterval(interval);
  }, [gyroData.x, gyroData.y, gyroData.z, fsrValue]);

  const handleButtonPress = () => {
    const now = Date.now();
    const newPresses = [...buttonPresses, now].filter(t => now - t < 10000);
    setButtonPresses(newPresses);
    
    if (newPresses.length > 1) {
      const intervals = [];
      for (let i = 1; i < newPresses.length; i++) {
        intervals.push(newPresses[i] - newPresses[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tapsPerSecond = 1000 / avgInterval;
      setTapping(Math.min(Math.abs(tapsPerSecond - 5) / 5, 1));
    }
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const getStatusColor = (val) => {
      if (val < 0.3) return '#22c55e';
      if (val < 0.5) return '#84cc16';
      if (val < 0.7) return '#eab308';
      if (val < 0.85) return '#f97316';
      return '#ef4444';
    };

    const getStatusLabel = (val) => {
      if (val < 0.3) return 'Safe';
      if (val < 0.5) return 'Normal';
      if (val < 0.7) return 'Monitor';
      if (val < 0.85) return 'Caution';
      return 'Alert';
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Parkinson's Assessment Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #1f2937;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4f46e5;
            font-size: 28px;
            margin-bottom: 8px;
          }
          .header p {
            color: #6b7280;
            font-size: 14px;
          }
          .info-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .info-label {
            font-weight: 600;
            color: #374151;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
          }
          .metric-header {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .metric-value {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .metric-status {
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
          }
          .sensor-data {
            margin-bottom: 30px;
          }
          .sensor-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .sensor-card {
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
          }
          .sensor-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #1f2937;
          }
          .sensor-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .sensor-row:last-child {
            border-bottom: none;
          }
          .overall-assessment {
            padding: 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .overall-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .overall-result {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Parkinson's Disease Assessment Report</h1>
          <p>Real-time Sensor Analysis & Tremor Detection</p>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="info-label">Patient Name:</span>
            <span>${patientName || 'Not Specified'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date:</span>
            <span>${currentDate}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Time:</span>
            <span>${currentTime}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Test Duration:</span>
            <span>Real-time Monitoring</span>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">Tremor Intensity</div>
            <div class="metric-value" style="color: ${getStatusColor(tremor)}">${(tremor * 100).toFixed(0)}%</div>
            <div class="metric-status" style="background-color: ${getStatusColor(tremor)}20; color: ${getStatusColor(tremor)}">
              ${getStatusLabel(tremor)}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">Grip Pressure</div>
            <div class="metric-value" style="color: ${getStatusColor(pressure)}">${(pressure * 100).toFixed(0)}%</div>
            <div class="metric-status" style="background-color: ${getStatusColor(pressure)}20; color: ${getStatusColor(pressure)}">
              ${getStatusLabel(pressure)}
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">Tapping Rhythm</div>
            <div class="metric-value" style="color: ${getStatusColor(tapping)}">${(tapping * 100).toFixed(0)}%</div>
            <div class="metric-status" style="background-color: ${getStatusColor(tapping)}20; color: ${getStatusColor(tapping)}">
              ${getStatusLabel(tapping)}
            </div>
          </div>
        </div>

        <div class="sensor-data">
          <div class="sensor-grid">
            <div class="sensor-card">
              <div class="sensor-title">Gyroscope Readings</div>
              <div class="sensor-row">
                <span>X-Axis</span>
                <span><strong>${gyroData.x.toFixed(2)}°/s</strong></span>
              </div>
              <div class="sensor-row">
                <span>Y-Axis</span>
                <span><strong>${gyroData.y.toFixed(2)}°/s</strong></span>
              </div>
              <div class="sensor-row">
                <span>Z-Axis</span>
                <span><strong>${gyroData.z.toFixed(2)}°/s</strong></span>
              </div>
            </div>
            <div class="sensor-card">
              <div class="sensor-title">Force & Tapping Data</div>
              <div class="sensor-row">
                <span>FSR Reading</span>
                <span><strong>${fsrValue.toFixed(0)} units</strong></span>
              </div>
              <div class="sensor-row">
                <span>Tapping Count</span>
                <span><strong>${buttonPresses.length} taps/10s</strong></span>
              </div>
              <div class="sensor-row">
                <span>Normal Range</span>
                <span><strong>4-6 taps/sec</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div class="overall-assessment">
          <div class="overall-title">Overall Assessment</div>
          <div class="overall-result">
            ${tremor < 0.3 ? '✓ Normal Range' : tremor < 0.7 ? '⚠ Monitor Required' : '⚠ Consult Doctor'}
          </div>
          <p>Based on current sensor readings and analysis</p>
        </div>

        <div class="footer">
          <p>This report is generated from real-time sensor data for diagnostic assistance purposes.</p>
          <p>Please consult with a qualified healthcare professional for medical advice.</p>
          <p style="margin-top: 10px;">Generated: ${currentDate} at ${currentTime}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const Spectrum = ({ value, label, icon: Icon }) => {
    const getColor = (val) => {
      if (val < 0.3) return '#22c55e';
      if (val < 0.5) return '#84cc16';
      if (val < 0.7) return '#eab308';
      if (val < 0.85) return '#f97316';
      return '#ef4444';
    };

    const getZoneLabel = (val) => {
      if (val < 0.3) return 'Safe';
      if (val < 0.5) return 'Normal';
      if (val < 0.7) return 'Monitor';
      if (val < 0.85) return 'Caution';
      return 'Alert';
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{label}</h3>
        </div>
        
        <div className="relative h-14 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-2xl mb-4 overflow-hidden shadow-inner">
          <div 
            className="absolute top-0 bottom-0 w-2 bg-white shadow-2xl transition-all duration-300 rounded-full"
            style={{ left: `calc(${value * 100}% - 4px)` }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
              {(value * 100).toFixed(0)}%
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-4 px-1">
          <span>Safe</span>
          <span>Normal</span>
          <span>Monitor</span>
          <span>Caution</span>
          <span>Alert</span>
        </div>

        <div 
          className="text-center py-3 rounded-xl font-bold text-lg shadow-md"
          style={{ 
            backgroundColor: `${getColor(value)}15`,
            color: getColor(value),
            border: `2px solid ${getColor(value)}40`
          }}
        >
          {getZoneLabel(value)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with floating animation */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl">
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Parkinson's Monitor
          </h1>
          <p className="text-gray-600 text-lg font-medium">Real-time sensor analysis and tremor detection</p>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
            />
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Spectrum value={tremor} label="Tremor Intensity" icon={Activity} />
          <Spectrum value={pressure} label="Grip Pressure" icon={Hand} />
          <Spectrum value={tapping} label="Tapping Rhythm" icon={Gauge} />
        </div>

        {/* Raw Sensor Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Gyroscope Data */}
          <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-8 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white">Gyroscope Data</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { axis: 'x', color: 'from-cyan-400 to-blue-400', label: 'X-Axis' },
                  { axis: 'y', color: 'from-blue-400 to-indigo-400', label: 'Y-Axis' },
                  { axis: 'z', color: 'from-indigo-400 to-purple-400', label: 'Z-Axis' }
                ].map(({ axis, color, label }) => (
                  <div key={axis} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white/90 font-bold text-lg">{label}</span>
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <span className="font-mono text-white font-black text-xl">
                          {gyroData[axis].toFixed(2)}°/s
                        </span>
                      </div>
                    </div>
                    <div className="relative h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r ${color} transition-all duration-100 rounded-full shadow-lg`}
                        style={{ width: `${Math.abs(gyroData[axis]) % 100}%` }}
                      >
                        <div className="w-full h-full bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FSR and Button */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Hand className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white">Force & Tapping</h3>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/90 font-bold text-lg">Force Sensor</span>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <span className="font-mono text-white font-black text-xl">{fsrValue.toFixed(0)}</span>
                    <span className="text-white/80 text-sm ml-1">units</span>
                  </div>
                </div>
                <div className="relative h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-100 rounded-full shadow-lg"
                    style={{ width: `${fsrValue}%` }}
                  >
                    <div className="w-full h-full bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <div className="text-center mb-4">
                  <p className="text-white/90 text-sm font-semibold mb-2">Tapping Test Results</p>
                  <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <span className="text-white font-black text-4xl">{buttonPresses.length}</span>
                    <span className="text-white/80 text-lg ml-2">taps/10s</span>
                  </div>
                </div>
                
                <button
                  onClick={handleButtonPress}
                  className="w-full py-5 bg-white text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-black text-xl rounded-2xl transition-all duration-300 active:scale-95 shadow-2xl hover:shadow-3xl border-4 border-white/30 hover:border-white/50"
                  style={{ backgroundColor: 'white' }}
                >
                  TAP HERE
                </button>
                
                <div className="mt-4 text-center">
                  <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
                    <p className="text-white/80 text-sm font-medium">
                      Normal: <span className="text-white font-bold">4-6 taps/sec</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl mb-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Overall Assessment</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 h-6 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${tremor * 100}%` }}
              />
            </div>
            <div className="text-center md:text-right">
              <div className="text-4xl font-black mb-2">
                {tremor < 0.3 ? '✓ Normal' : tremor < 0.7 ? '⚠ Monitor' : '⚠ Consult Doctor'}
              </div>
              <p className="text-white/90 font-medium">Based on current readings</p>
            </div>
          </div>
        </div>

        {/* Generate PDF Button */}
        <div className="flex justify-center">
          <button
            onClick={generatePDF}
            className="group flex items-center gap-3 px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-200"
          >
            <Download className="w-6 h-6 text-indigo-600 group-hover:animate-bounce" />
            <span className="text-lg">Generate PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;