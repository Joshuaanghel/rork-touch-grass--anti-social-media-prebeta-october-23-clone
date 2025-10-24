# Admin Guide: Accessing User Data in Touch Grass

This guide explains how to access all user emails, feedback responses, and other data collected through the Touch Grass app.

## 🔐 Authentication System

The app now uses email/password authentication restricted to **@usf.edu emails only** (University of South Florida students). This ensures a trusted community and proper data collection.

### User Flow:
1. User signs up with USF email (@usf.edu) and password
2. User completes personality test (AI-adaptive quiz)
3. User creates profile
4. User submits feedback survey
5. All data is saved to backend database

---

## 📊 Accessing Data in Rork

### Method 1: Admin Panel UI (Recommended) ⭐

**How to access:**

#### Option A: Direct URL (Easiest)
1. Look at your Rork preview URL in the browser address bar
2. It will look something like: `https://[your-project-name].rork.com/` 
3. Add `/admin-panel` to the end: `https://[your-project-name].rork.com/admin-panel`
4. Press Enter to navigate to the admin panel
5. Click "Load Data" button

#### Option B: Navigate from anywhere in the app
1. Manually type `/admin-panel` at the end of your current URL
2. For example, if you're at `https://abc123.rork.com/onboarding`, change it to `https://abc123.rork.com/admin-panel`

**What you'll see:**
- **User Emails**: All signed-up @usf.edu emails with signup dates
- **User Profiles**: Names, personality types, bios
- **Feedback Responses**: All 5-question survey answers
- **Quiz Responses**: Personality test answers and AI findings

**Features:**
- Real-time data viewing
- Export/Share functionality (copies JSON data)
- Stats dashboard showing total users and feedback count
- Refresh button to get latest data

**To export data:**
1. Click "Export/Share Data" button
2. On mobile: Share via native share sheet
3. On web: Data is logged to browser console (check Developer Tools)

---

### Method 2: Backend API Route

**Direct API access:**
```
GET https://[your-rork-url]/api/trpc/admin.export
```

This returns a JSON object with all data:
```json
{
  "users": [...],           // User profiles
  "userAuth": [...],        // User emails (without passwords)
  "feedbackResponses": [...], // Feedback survey answers
  "userCount": 123,         // Total user count
  "quizResponses": [...],   // Personality quiz responses
  "exportedAt": "2025-01-24T..."
}
```

**How to call it:**
1. In Rork, open Browser Developer Tools (F12)
2. Go to Console tab
3. Run:
```javascript
fetch('/api/trpc/admin.export')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
```
4. Copy the output JSON

---

### Method 3: Console Logs

All data operations log to the console in real-time:

**In Rork backend logs:**
- Look for `[DB]` prefixed messages
- Shows: user creation, feedback submission, quiz responses

**In browser console:**
- Shows API calls and responses
- Use filter: `[API]` or `[DB]`

---

## 📧 What Data is Collected

### User Authentication
- **Email**: USF student email (@usf.edu)
- **User ID**: Unique identifier
- **Created At**: Signup timestamp
- **Password**: Hashed (SHA-256), never exposed in exports

### User Profiles
- Name
- Bio
- Personality Type (10 types: Explorer, Connector, Creator, Thinker, Adventurer, Nurturer, Visionary, Catalyst, Harmonizer, Maverick)
- Hobbies
- Color preference
- Trophies & achievements
- Onboarding status

### Feedback Responses (5 Questions)
1. Which feature are you most excited about?
2. What would make Touch Grass a must-have app for you?
3. How do you imagine using Touch Grass in your daily life?
4. If you could add ONE feature to Touch Grass, what would it be?
5. What's your biggest challenge with current social apps?

### Quiz Responses
- All 10 personality test questions and answers
- AI-generated insights:
  - Dominant traits
  - Decision-making style
  - Social energy level
  - Stress response pattern
  - Communication preference
  - Personality percentages

---

## 🔒 Security Notes

1. **Passwords are hashed**: Never stored or exported in plain text
2. **Admin panel has no authentication**: Currently open to anyone with the URL. Consider adding password protection before public release.
3. **Data is in-memory**: Stored in Node.js memory during Rork session. Data persists as long as the backend is running, but will be lost if Rork restarts.
4. **For production**: Implement proper database (PostgreSQL, MongoDB) and authentication for admin panel

---

## 🚀 Quick Start for Data Collection

1. **Share app with USF students**
2. **Access admin panel**: 
   - Open app in Rork
   - Tap "Profile" tab (bottom right)
   - Scroll down and tap "Admin Panel" button
3. **Monitor signups**: Click "Refresh Data" to see new users
4. **Export data periodically**: Use Export/Share button to save data externally

**IMPORTANT:** Since the app is in pre-launch beta (waiting room is the final screen), there are no tabs anymore. Simply access the admin panel via the direct URL method described above.

### Example URLs:
- If your app is at: `https://touch-grass.rork.com/`
- Admin panel is at: `https://touch-grass.rork.com/admin-panel`

If you're still getting 404, make sure:
1. You're using the correct project URL from Rork
2. You include `/admin-panel` at the very end
3. There are no extra slashes or spaces

---

## 💡 Tips

- **Bookmark the admin panel**: Save `/admin-panel` as a favorite in Rork
- **Regular exports**: Since data is in-memory, export regularly to avoid data loss
- **Check console logs**: Use browser DevTools to see real-time data flow
- **Test the flow**: Create a test account to see the full user journey

---

## 📞 Troubleshooting

**No data showing:**
- Click "Load Data" button first
- Check console for errors
- Verify users have completed signup + feedback

**Can't export data:**
- On mobile: Use Share feature
- On web: Check browser console for logged JSON
- Alternative: Copy data directly from admin panel UI

**Data disappeared:**
- Rork backend restarted (in-memory data cleared)
- Need to implement persistent database for production

---

## 🎯 Next Steps for Production

Before public launch, consider:

1. **Persistent Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Admin Authentication**: Password-protect admin panel
3. **Data Export**: Add CSV/Excel export for easier analysis
4. **Analytics Dashboard**: Add charts and visualizations
5. **Email Verification**: Send verification emails to @usf.edu addresses
6. **GDPR Compliance**: Add privacy policy and data deletion features

---

## Example: Viewing Your Data

1. Go to your Rork app preview
2. Add `/admin-panel` to the URL
3. Click "Load Data"
4. You'll see something like:

**User Emails Section:**
```
student1@usf.edu   | Jan 24, 2025
student2@usf.edu   | Jan 24, 2025
```

**Feedback Responses Section:**
```
student1@usf.edu
Q1: Events
Q2: Finding genuine connections with people nearby
Q3: Meeting new people at events
Q4: Group chat for event attendees
Q5: Too much screen time
```

5. Click "Export/Share Data" to save all data as JSON

---

That's it! You now have full access to all user data collected through Touch Grass. 🎉
