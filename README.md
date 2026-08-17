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

## 資料結構

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/expenses/{expenseId}
```

舊版匿名登入的共用資料不會自動搬入 Google 帳號；如需保留舊資料，應另做一次性遷移。
