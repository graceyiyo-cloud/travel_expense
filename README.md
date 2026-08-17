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

## Gemini API Key 跨裝置同步

可設定最多三組 Gemini API Key。若要跨裝置使用，請在 AI 掃描設定輸入至少 4 個字元的同步密碼並按「加密同步」。另一台裝置登入同一 Google 帳號後，輸入相同密碼並按「雲端還原」。建議混合英文字母與數字，不要使用容易猜中的純數字密碼。

Key 會在瀏覽器端以 AES-256-GCM 加密，金鑰由同步密碼透過 PBKDF2-SHA256（250,000 次）產生；同步密碼不會上傳。忘記同步密碼後無法解密原有資料，只能用新密碼重新同步。

## 資料結構

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/expenses/{expenseId}
```

舊版匿名登入的共用資料不會自動搬入 Google 帳號；如需保留舊資料，應另做一次性遷移。
