# Travel Expense

## Firebase 設定

1. 在 Firebase Console → Authentication → Sign-in method 啟用 **Google** 登入。
2. 在 Authentication → Settings → Authorized domains 加入實際部署網域（本機測試可用 `localhost`）。
3. 將 `firestore.rules` 發佈到 Firestore，讓每位使用者只能存取自己的資料。
4. 使用本機 HTTP 伺服器或部署網站，不要直接用 `file://` 開啟 `index.html`，否則 Google 登入彈窗可能無法正常運作。

例如：

```powershell
python -m http.server 8080
```

開啟 `http://localhost:8080`。

## 安裝成手機 App

- Android/Chrome：登入後在專案頁點「安裝 App」，或從瀏覽器選單選擇安裝。
- iPhone/Safari：點分享按鈕，再選擇「加入主畫面」。
- PWA 與 Service Worker 必須透過 HTTPS 或 `localhost` 執行；GitHub Pages 已提供 HTTPS。

## 備份與還原

登入後可在專案頁匯出整個帳號下的專案與支出為 JSON。還原時會建立名稱帶有「（還原）」的新專案，不會覆蓋既有資料。Gemini API Key 不會寫入備份檔。

## 資料結構

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/expenses/{expenseId}
```

舊版匿名登入的共用資料不會自動搬入 Google 帳號；如需保留舊資料，應另做一次性遷移。
