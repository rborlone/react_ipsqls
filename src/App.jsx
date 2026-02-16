import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { getCountryCode } from './utils/countryHelpers';
import './App.css';

const BATCH_SIZE = 10; // Número de IPs a procesar por lote
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [ipData, setIpData] = useState([]);
  const [pendingIps, setPendingIps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [totalIps, setTotalIps] = useState(0);
  const [stats, setStats] = useState(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setLoading(true);
    setIpData([]);
    setPendingIps([]);

    try {
      // Leer archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Extraer IPs
      const ips = jsonData
        .flat()
        .filter(cell => {
          if (!cell) return false;
          const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
          return ipRegex.test(String(cell).trim());
        })
        .map(ip => String(ip).trim());

      if (ips.length === 0) {
        setError('No se encontraron direcciones IP válidas en el archivo.');
        setLoading(false);
        return;
      }

      setTotalIps(ips.length);
      setPendingIps(ips);
      setLoading(false);

      // Cargar el primer lote automáticamente
      await loadNextBatch(ips, []);
    } catch (err) {
      setError(`Error al procesar el archivo: ${err.message}`);
      setLoading(false);
    }
  };

  const loadNextBatch = async (remainingIps, currentData) => {
    if (loadingRef.current || remainingIps.length === 0) return;

    loadingRef.current = true;
    setLoadingMore(true);

    const batch = remainingIps.slice(0, BATCH_SIZE);
    const newRemaining = remainingIps.slice(BATCH_SIZE);

    try {
      // Usar endpoint batch del backend
      const response = await axios.post(`${API_URL}/api/ips/batch`, {
        ips: batch
      });

      const results = response.data.results || [];
      const updatedData = [...currentData, ...results];
      setIpData(updatedData);
      setPendingIps(newRemaining);

      // Actualizar estadísticas después de procesar el batch
      fetchStats();
    } catch (err) {
      // Si falla el batch, intentar uno por uno como fallback
      console.error('Error en batch request, usando fallback:', err);
      const results = [];
      for (let i = 0; i < batch.length; i++) {
        try {
          const response = await axios.get(`${API_URL}/api/ip/${batch[i]}`);
          results.push(response.data);
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          results.push({
            ip: batch[i],
            status: 'fail',
            message: 'Error al obtener datos'
          });
        }
      }
      const updatedData = [...currentData, ...results];
      setIpData(updatedData);
      setPendingIps(newRemaining);
    }

    setLoadingMore(false);
    loadingRef.current = false;
  };

  // Obtener estadísticas de caché
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
    }
  };

  // Cargar estadísticas al iniciar
  useEffect(() => {
    fetchStats();
  }, []);

  // Configurar Intersection Observer para detectar scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pendingIps.length > 0 && !loadingRef.current) {
          loadNextBatch(pendingIps, ipData);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [pendingIps, ipData]);

  const getFlag = (countryCode) => {
    if (!countryCode) return '🏳️';
    // Convertir código de país a emoji de bandera
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="App">
      <h1>🌍 IP Geolocation Viewer</h1>
      
      <div className="upload-container">
        <label htmlFor="file-upload" className="file-label">
          <strong>Selecciona un archivo Excel con direcciones IP</strong>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="file-input"
        />
      </div>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <p>Cargando archivo Excel...</p>
          <p>Por favor espera...</p>
        </div>
      )}

      {totalIps > 0 && (
        <div className="progress-info">
          <p>
            Cargadas: <strong>{ipData.length}</strong> de <strong>{totalIps}</strong> IPs
            {pendingIps.length > 0 && ' - Scroll para cargar más'}
          </p>
          {stats && (
            <div className="cache-stats">
              <span title="IPs en Redis (caché rápido)">
                🔴 Redis: <strong>{stats.redis.cachedIps}</strong>
              </span>
              <span title="IPs en MongoDB (persistencia)">
                🟢 MongoDB: <strong>{stats.mongodb.totalIps}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {ipData.length > 0 && (
        <div className="results">
          <h2>Resultados</h2>
          <table>
            <thead>
              <tr>
                <th>IP</th>
                <th>Bandera</th>
                <th>País</th>
                <th>Región</th>
                <th>Ciudad</th>
                <th>ISP</th>
                <th>Lat / Lon</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ipData.map((item, index) => (
                <tr key={index}>
                  <td>{item.ip}</td>
                  <td className="flag">
                    {item.countryCode ? (
                      <span className={`fi fi-${item.countryCode.toLowerCase()}`} title={item.country}></span>
                    ) : (
                      <span className="fi fi-xx" title="Desconocido"></span>
                    )}
                  </td>
                  <td>{item.country || '-'}</td>
                  <td>{item.regionName || '-'}</td>
                  <td>{item.city || '-'}</td>
                  <td>{item.isp || '-'}</td>
                  <td>
                    {item.lat && item.lon 
                      ? `${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}`
                      : '-'
                    }
                  </td>
                  <td>
                    <span className={item.status === 'success' ? 'status-success' : 'status-fail'}>
                      {item.status === 'success' ? '✓' : '✗'}
                    </span>
                    {item.source && (
                      <span className={`source-badge source-${item.source}`} title={`Fuente: ${item.source}`}>
                        {item.source === 'redis' ? '⚡' : item.source === 'mongodb' ? '💾' : '🌐'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Elemento observador para trigger de scroll */}
          {pendingIps.length > 0 && (
            <div ref={observerRef} className="scroll-trigger">
              {loadingMore && (
                <div className="loading-more">
                  <p>Cargando más IPs...</p>
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          )}

          {pendingIps.length === 0 && !loadingMore && (
            <div className="complete-message">
              ✅ Todas las IPs han sido procesadas
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
