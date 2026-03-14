import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../squad-hub-v8.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

กด **"Commit changes"** ✅

---

## เช็คโครงสร้างก่อนไปต่อ

หลังทำครบ repo ควรมีไฟล์แบบนี้ครับ:
```
squad-hub/
├── index.html
├── package.json
├── squad-hub-v8.jsx
└── src/
    └── main.jsx
