import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../squad-hub-v8.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**6.** กด **"Commit changes"** ✅

---

### แก้ปัญหาที่ 2 — เปลี่ยนชื่อไฟล์ให้ถูก

**1.** กดเข้าไปที่ไฟล์ `squad-hub-v8 (1).jsx`

**2.** กดไอคอน ✏️ (Edit) มุมขวาบน

**3.** แก้ชื่อไฟล์ด้านบนสุดจาก `squad-hub-v8 (1).jsx` → **`squad-hub-v8.jsx`**

**4.** กด **"Commit changes"** ✅

---

หลังทำครบสองอย่างแล้ว โครงสร้างควรเป็นแบบนี้ครับ:
```
squad-hub/
├── index.html
├── package.json
├── vite.config.js
├── squad-hub-v8.jsx
└── src/
    └── main.jsx
