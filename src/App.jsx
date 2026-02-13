import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { getCountryCode } from './utils/countryHelpers';
import './App.css';

const BATCH_SIZE = 10; // Número de IPs a procesar por lote

function App() {
  const [ipData, setIpData] = useState([]);
  const [pendingIps, setPendingIps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [totalIps, setTotalIps] = useState(0);
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

    const results = [];
    for (let i = 0; i < batch.length; i++) {
      try {
        const response = await axios.get(`http://ip-api.com/json/${batch[i]}`);
        results.push({
          ip: batch[i],
          ...response.data
        });

        // Pequeño delay entre requests (aproximadamente 1.5 segundos por IP)
        await new Promise(resolve => setTimeout(resolve, 1500));
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
    setLoadingMore(false);
    loadingRef.current = false;
  };

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
                    {item.countryCode ? getFlag(item.countryCode) : '🏳️'}
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
