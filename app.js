// Global variables
let map = null;
let callLogsData = [];
let locationData = [];
let mapCenter = null;
let mapZoom = 12;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set initial body class for login mode
    document.body.className = 'login-mode';
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }
    
    // Setup login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Setup tab change events
    document.getElementById('location-tab').addEventListener('click', function() {
        setTimeout(initializeMap, 200); // Longer delay for mobile
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            if (map) {
                map.invalidateSize();
                if (mapCenter) {
                    map.setView(mapCenter, mapZoom);
                }
            }
        }, 500);
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        setTimeout(function() {
            if (map) {
                map.invalidateSize();
            }
        }, 100);
    });
});

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password) {
        localStorage.setItem('isLoggedIn', 'true');
        showDashboard();
        errorDiv.style.display = 'none';
    } else {
        errorDiv.textContent = 'Invalid username or password';
        errorDiv.style.display = 'block';
    }
}

// Show dashboard
function showDashboard() {
    document.body.className = 'dashboard-mode';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    
    // Load initial data
    loadCallLogs();
    loadLocationData();
}

// Logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    document.body.className = 'login-mode';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('dashboardPage').style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Load call logs data
async function loadCallLogs() {
    const loadingDiv = document.getElementById('callsLoading');
    const tableDiv = document.getElementById('callsTable');
    
    loadingDiv.style.display = 'block';
    tableDiv.style.display = 'none';
    
    try {
        const response = await fetch(API_ENDPOINTS.callLogs);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        callLogsData = [];
        
        if (data) {
            // Convert Firebase object to array
            Object.keys(data).forEach(key => {
                callLogsData.push({
                    id: key,
                    ...data[key]
                });
            });
            
            // Sort by timestamp (newest first)
            callLogsData.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        displayCallLogs();
        updateStats();
        
    } catch (error) {
        console.error('Error loading call logs:', error);
        showError('Failed to load call logs. Please check your connection and try again.');
    }
    
    loadingDiv.style.display = 'none';
    tableDiv.style.display = 'block';
}

// Display call logs in table
function displayCallLogs() {
    const tbody = document.getElementById('callsTableBody');
    tbody.innerHTML = '';
    
    if (callLogsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No call logs found</td></tr>';
        return;
    }
    
    callLogsData.forEach(call => {
        const row = document.createElement('tr');
        
        // Format timestamp to readable date
        const date = new Date(call.timestamp);
        const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        // Get status badge color
        let statusClass = 'badge bg-secondary';
        switch (call.call_status) {
            case 'Incoming':
                statusClass = 'badge bg-success';
                break;
            case 'Outgoing':
                statusClass = 'badge bg-primary';
                break;
            case 'Missed':
                statusClass = 'badge bg-danger';
                break;
        }
        
        row.innerHTML = `
            <td>${call.caller_number || 'Unknown'}</td>
            <td>${call.caller_name || ''}</td>
            <td><span class="${statusClass}">${call.call_status || 'Unknown'}</span></td>
            <td>${call.duration || '00:00:00'}</td>
            <td>${formattedDate}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Load location data
async function loadLocationData() {
    const loadingDiv = document.getElementById('locationLoading');
    const mapContainer = document.getElementById('mapContainer');
    
    loadingDiv.style.display = 'block';
    mapContainer.style.display = 'none';
    
    try {
        const response = await fetch(API_ENDPOINTS.location);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        locationData = [];
        
        if (data) {
            // Convert Firebase object to array
            Object.keys(data).forEach(key => {
                locationData.push({
                    id: key,
                    ...data[key]
                });
            });
            
            // Sort by timestamp (oldest first for path drawing)
            locationData.sort((a, b) => a.timestamp - b.timestamp);
        }
        
        updateStats();
        initializeMap();
        
    } catch (error) {
        console.error('Error loading location data:', error);
        showError('Failed to load location data. Please check your connection and try again.');
    }
    
    loadingDiv.style.display = 'none';
    mapContainer.style.display = 'block';
}

// Initialize map
function initializeMap() {
    // Remove existing map if it exists
    if (map) {
        map.remove();
    }
    
    // Determine initial center and zoom based on location data
    let initialCenter = [37.7749, -122.4194]; // Default to San Francisco
    let initialZoom = 10;
    
    if (locationData.length > 0) {
        // Calculate center from location data
        let totalLat = 0;
        let totalLng = 0;
        let validPoints = 0;
        
        locationData.forEach(location => {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                totalLat += lat;
                totalLng += lng;
                validPoints++;
            }
        });
        
        if (validPoints > 0) {
            initialCenter = [totalLat / validPoints, totalLng / validPoints];
            initialZoom = locationData.length === 1 ? 15 : 12;
            
            // Store center for later use
            mapCenter = initialCenter;
            mapZoom = initialZoom;
            
            // Show center button
            document.getElementById('centerMapBtn').style.display = 'inline-block';
        }
    }
    
    // Create new map centered on location data
    map = L.map('map').setView(initialCenter, initialZoom);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Force map to invalidate size after a short delay to fix positioning issues
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
            map.setView(initialCenter, initialZoom);
        }
    }, 100);
    
    if (locationData.length === 0) {
        // Hide center button if no data
        document.getElementById('centerMapBtn').style.display = 'none';
        
        // Show message if no data
        const popup = L.popup()
            .setLatLng(initialCenter)
            .setContent('No location data available')
            .openOn(map);
        return;
    }
    
    // Create arrays for coordinates and markers
    const coordinates = [];
    const markers = [];
    
    locationData.forEach((location, index) => {
        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
            coordinates.push([lat, lng]);
            
            // Create marker
            const date = new Date(location.timestamp);
            const formattedDate = date.toLocaleString();
            
            const marker = L.marker([lat, lng])
                .bindPopup(`
                    <strong>Location Point ${index + 1}</strong><br>
                    <strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
                    <strong>Accuracy:</strong> ${location.accuracy || 'Unknown'}m<br>
                    <strong>Time:</strong> ${formattedDate}
                `);
            
            markers.push(marker);
        }
    });
    
    if (coordinates.length > 0) {
        // Add all markers to map
        markers.forEach(marker => marker.addTo(map));
        
        // Create polyline connecting all points
        if (coordinates.length > 1) {
            const polyline = L.polyline(coordinates, {
                color: 'blue',
                weight: 3,
                opacity: 0.7
            }).addTo(map);
            
            // Fit map to show all points with proper centering
            const bounds = polyline.getBounds();
            map.fitBounds(bounds, { padding: [20, 20] });
            
            // Update stored center and zoom
            mapCenter = bounds.getCenter();
            mapZoom = map.getZoom();
        } else {
            // If only one point, center on it
            mapCenter = coordinates[0];
            mapZoom = 15;
            map.setView(mapCenter, mapZoom);
        }
        
        // Add start and end markers
        if (coordinates.length > 1) {
            // Start marker (green)
            L.marker(coordinates[0], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).bindPopup('<strong>Start Point</strong>').addTo(map);
            
            // End marker (red)
            L.marker(coordinates[coordinates.length - 1], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).bindPopup('<strong>End Point</strong>').addTo(map);
        }
    }
}

// Update statistics
function updateStats() {
    // Call statistics
    const totalCalls = callLogsData.length;
    const incomingCalls = callLogsData.filter(call => call.call_status === 'Incoming').length;
    const outgoingCalls = callLogsData.filter(call => call.call_status === 'Outgoing').length;
    const locationPoints = locationData.length;
    
    document.getElementById('totalCalls').textContent = totalCalls;
    document.getElementById('incomingCalls').textContent = incomingCalls;
    document.getElementById('outgoingCalls').textContent = outgoingCalls;
    document.getElementById('locationPoints').textContent = locationPoints;
}

// Show error message
function showError(message) {
    alert(message); // Simple alert for now, can be enhanced with better UI
}

// Center map on data
function centerMapOnData() {
    if (map && mapCenter) {
        // Zoom in more when centering
        const zoomLevel = mapZoom + 2;
        map.setView(mapCenter, zoomLevel, {
            animate: true,
            duration: 1.0
        });
    }
}

// Utility function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}