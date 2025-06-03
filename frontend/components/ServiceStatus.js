// Service Status Component for PORTMAN
import { useState, useEffect } from 'react';

const ServiceStatus = () => {  const [services, setServices] = useState([
    { name: 'Frontend', url: 'http://localhost:3000', status: 'checking', port: 3000, description: 'Next.js Web Application' },
    { name: 'Backend API', url: 'http://localhost:5000/api/health', status: 'checking', port: 5000, description: 'Express.js API Server' },
    { name: 'CV Parser', url: 'http://localhost:6060/health', status: 'checking', port: 6060, description: 'AI-Powered CV Extraction' },
  ]);

  const checkServiceHealth = async (service) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      let response;
      if (service.name === 'Frontend') {
        // For frontend, we know it's running if we can access this page
        response = { ok: true };
      } else {
        response = await fetch(service.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
      }

      clearTimeout(timeoutId);
      
      if (response.ok) {
        return 'online';
      } else {
        console.error(`Service ${service.name} returned non-ok response:`, response.status, response.statusText);
        return 'error';
      }
    } catch (error) {
      console.error(`Service ${service.name} health check error:`, error);
      if (error.name === 'AbortError') {
        return 'timeout';
      }
      return 'offline';
    }
  };

  const checkAllServices = async () => {
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const status = await checkServiceHealth(service);
        return { ...service, status };
      })
    );
    setServices(updatedServices);
  };

  useEffect(() => {
    checkAllServices();
    // Check services every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'offline': return '#f44336';
      case 'error': return '#ff9800';
      case 'timeout': return '#ff5722';
      case 'checking': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '✅';
      case 'offline': return '❌';
      case 'error': return '⚠️';
      case 'timeout': return '⏰';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      case 'timeout': return 'Timeout';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  const allServicesOnline = services.every(service => service.status === 'online');
  const criticalServicesOnline = services.filter(s => s.name !== 'CV Parser').every(service => service.status === 'online');
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.08) 0%, rgba(0, 242, 254, 0.05) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '0',
      border: '1px solid rgba(79, 172, 254, 0.15)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      maxWidth: '800px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🖥️ System Status
          <span style={{
            padding: '6px 16px',
            borderRadius: '25px',
            fontSize: '0.75rem',
            background: allServicesOnline ? 
              'linear-gradient(135deg, #4caf50, #45a049)' : 
              criticalServicesOnline ? 
              'linear-gradient(135deg, #ff9800, #f57400)' : 
              'linear-gradient(135deg, #f44336, #d32f2f)',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {allServicesOnline ? 'All Systems Operational' : criticalServicesOnline ? 'Partial Service' : 'System Issues'}
          </span>
        </h3>
        <button
          onClick={checkAllServices}
          style={{
            background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.1))',
            border: '1px solid rgba(79, 172, 254, 0.3)',
            borderRadius: '10px',
            color: '#4facfe',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.25), rgba(0, 242, 254, 0.2))';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.1))';
            e.target.style.transform = 'translateY(0px)';
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {services.map((service, index) => (
          <div
            key={index}
            style={{
              background: service.status === 'online' ? 
                'linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.04))' :
                'linear-gradient(135deg, rgba(244, 67, 54, 0.08), rgba(244, 67, 54, 0.04))',
              borderRadius: '12px',
              padding: '18px',
              border: `1px solid ${getStatusColor(service.status)}30`,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Subtle animated background effect for online services */}
            {service.status === 'online' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, ${getStatusColor(service.status)}05, transparent)`,
                animation: 'pulse 3s infinite',
                borderRadius: '12px'
              }} />
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  fontSize: '1.2rem',
                  filter: service.status === 'online' ? 'none' : 'grayscale(50%)'
                }}>
                  {getStatusIcon(service.status)}
                </span>
                <strong style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: service.status === 'online' ? '#ffffff' : '#b3c0ff'
                }}>
                  {service.name}
                </strong>
              </div>
              <span style={{
                color: getStatusColor(service.status),
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {getStatusText(service.status)}
              </span>
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: '#b3c0ff',
              marginBottom: '8px',
              position: 'relative',
              zIndex: 1
            }}>
              {service.description}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#8b9dc3',
              position: 'relative',
              zIndex: 1
            }}>
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem'
              }}>
                Port: {service.port}
              </span>
              {service.status === 'online' && (
                <a
                  href={service.name === 'Frontend' ? service.url : `http://localhost:${service.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#4facfe',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = '#00f2fe';
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = '#4facfe';
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  🔗 Open
                </a>
              )}
            </div>

            {service.status === 'offline' && (
              <div style={{
                marginTop: '12px',
                padding: '10px',
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(244, 67, 54, 0.08))',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#ffcdd2',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                💡 <strong>Try running:</strong> <br/>
                <code style={{ 
                  background: 'rgba(0,0,0,0.4)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  {service.name === 'Backend API' ? 'node server.js' : 
                   service.name === 'CV Parser' ? 'python deepseek_cv_parser.py' : 
                   'npm run dev'}
                </code>
              </div>
            )}
          </div>
        ))}
      </div>

      {!allServicesOnline && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(255, 152, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 152, 0, 0.3)'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#ffcc02', marginBottom: '8px' }}>
            ⚠️ <strong>Service Issues Detected</strong>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fff3e0' }}>
            Some services are not responding. This may affect functionality. 
            Try running the startup scripts or check the individual services.
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
            <strong>Quick fixes:</strong>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              <li>Run <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>START_PORTMAN.bat</code></li>
              <li>Or use <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>.\quick_start.ps1</code></li>
              <li>Check if ports 3000, 5000, 6060 are available</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceStatus;
