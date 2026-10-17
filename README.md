# ApplyWise — Internship & OA Tracker (Version 2.0)

A responsive, frontend-only internship and placement tracker built with HTML, CSS and vanilla JavaScript.

## Run locally
1. Extract the project ZIP.
2. Open the extracted `ApplyWise` folder in VS Code. The project is separated into `index.html` (structure), `styles.css` (design and responsive layout), and `script.js` (application logic). Open `index.html` in a modern browser, or use Live Server in VS Code.
3. The app stores records in the browser's `localStorage`; no installation or backend is required.

## Project files
- `index.html` — page structure and forms
- `styles.css` — colors, layout, responsive rules, and visual styling
- `script.js` — application data, rendering, events, Kanban drag-and-drop, calendar, notes, theme, and localStorage

## Features
- Dashboard summary cards and application table
- Add, edit and delete applications
- Search, status filtering and sorting
- Upcoming deadlines and recruitment progress
- Light/dark theme, keyboard shortcuts, responsive layout
- CSV export
- **Kanban board:** drag an application between Saved, Applied, Assessment, Interview, Offer and Rejected columns; the updated status is saved
- **Application calendar:** monthly calendar with clickable deadline events; click an event to edit the application
- **Company notes:** notes and next steps are shown by company; edit a record to update recruiter details, OA learnings, interview preparation or follow-up notes

## Data and limitations
- Data is stored in the current browser and website origin only.
- There is no authentication, backend, cloud sync or cross-device synchronization.
- Calendar events currently use the application's single deadline field; separate OA/interview event types are not implemented yet.
- Drag-and-drop works best with a mouse/trackpad on desktop. The application status can also be changed from the edit form, including on mobile.
- Sample company records are illustrative. Replace them with your own data before publishing screenshots or a demo.

## Suggested resume entry (after testing)
**ApplyWise — Internship & OA Tracker | HTML, CSS, JavaScript**
- Built a responsive placement tracker with CRUD operations, search/filter/sort, deadline prioritization and CSV export.
- Implemented a drag-and-drop Kanban pipeline and monthly deadline calendar with editable events.
- Added company-specific preparation notes and browser-based persistence using localStorage.

## Interview topics to understand
- DOM selection and event delegation
- Array methods (`map`, `filter`, `find`)
- State updates and re-rendering UI from a shared data array
- HTML Drag and Drop API
- Date handling and calendar grid generation
- JSON serialization and localStorage limitations
- Input validation and escaping user-provided text
