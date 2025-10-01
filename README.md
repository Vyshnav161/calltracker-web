# Call Tracker Web Dashboard

A web-based dashboard to view and analyze call logs and location tracking data from your Firebase database.

## Features

### 🔐 Secure Login
- Username: `Admin`
- Password: `Admin@8129`
- Session management with localStorage

### 📞 Call Logs Tab
- View all call logs in a sortable table
- Display caller number, name, status, duration, and timestamp
- Real-time statistics (total calls, incoming, outgoing)
- Refresh functionality
- Responsive design

### 🗺️ Location Tracking Tab
- Interactive map showing all location points
- Connected path showing movement over time
- Start point (green marker) and end point (red marker)
- Popup details for each location point
- Chronological path visualization

### 📊 Dashboard Statistics
- Total calls count
- Incoming calls count
- Outgoing calls count
- Location points count

## Setup Instructions

### 1. Update Configuration
Edit `config.js` and update the Firebase credentials:

```javascript
const FIREBASE_CONFIG = {
    databaseURL: 'YOUR_FIREBASE_DATABASE_URL',
    apiKey: 'YOUR_FIREBASE_API_KEY'
};
```

### 2. Firebase Security Rules
Make sure your Firebase Realtime Database has the correct security rules. For testing, you can use:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Warning:** These rules allow public access. For production, implement proper authentication.

### 3. Run the Dashboard

#### Option 1: Simple HTTP Server (Python)
```bash
cd web-dashboard
python -m http.server 8000
```
Then open: http://localhost:8000

#### Option 2: Simple HTTP Server (Node.js)
```bash
cd web-dashboard
npx http-server -p 8000
```
Then open: http://localhost:8000

#### Option 3: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 4. Access the Dashboard
1. Open the dashboard in your web browser
2. Login with:
   - Username: `Admin`
   - Password: `Admin@8129`
3. View your data in the two tabs

## File Structure

```
web-dashboard/
├── index.html          # Main HTML file with UI
├── app.js             # JavaScript application logic
├── config.js          # Configuration file (Firebase credentials)
└── README.md          # This file
```

## Features Breakdown

### Call Logs Table
- **Caller Number**: Phone number of the caller
- **Caller Name**: Contact name (if available)
- **Call Status**: Incoming (green), Outgoing (blue), Missed (red)
- **Duration**: Call duration in HH:MM:SS format
- **Date & Time**: Formatted timestamp

### Location Map
- **Blue Line**: Shows the path taken in chronological order
- **Red Markers**: Individual location points with details
- **Green Marker**: Starting point of the journey
- **Red Marker**: Ending point of the journey
- **Popup Info**: Coordinates, accuracy, and timestamp

## Troubleshooting

### 1. No Data Showing
- Check Firebase security rules
- Verify API key and database URL in `config.js`
- Check browser console for errors
- Ensure Firebase database has data

### 2. Map Not Loading
- Check internet connection (requires OpenStreetMap tiles)
- Verify location data has valid latitude/longitude values
- Check browser console for JavaScript errors

### 3. Login Issues
- Verify credentials in `config.js`
- Clear browser localStorage if needed
- Check for typos in username/password

### 4. CORS Issues
- Use a local HTTP server (don't open HTML file directly)
- Check Firebase CORS settings if needed

## Security Notes

- Change default login credentials for production use
- Implement proper Firebase authentication for production
- Use environment variables for sensitive configuration
- Consider implementing HTTPS for production deployment

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Bootstrap 5.1.3 (CSS framework)
- Leaflet 1.9.4 (Map library)
- OpenStreetMap (Map tiles)

All dependencies are loaded via CDN, no local installation required.