# 第七週作業：第三方套件實戰整合

## 情境說明

本週作業學習使用第三方套件優化電商系統，包含 **dayjs**（日期處理）與 **axios**（HTTP 請求），並學習資料驗證與訂單服務模組化設計。
API 串接練習延續使用學院的 [LiveJS 電商 API](https://hexschool.github.io/hexschoolliveswagger/)。

---

## 快速開始

### Step 1：環境準備

1. 確認 Node.js 版本 >= 18
2. 下載此作業專案後，需打開終端機輸入 `npm install`

### Step 2：設定環境變數

在專案根目錄建立 `.env` ，並在 `.env` 檔案中設定環境變數：

```bash

# 第七週作業 RD 筆記

---

## 一、整體架構流程

- 主要流程：API 取得資料 → 處理資料 → 篩選 → 回傳
- 對應程式步驟：  
	1. axios 取得 orders  
	2. map 處理資料結構  
	3. filter 篩選條件  
	4. 回傳給 UI 或前端使用

---

## 二、第三方套件 dayjs（日期處理）

- **timestamp 單位**：API 回傳「秒」，dayjs 預設「毫秒」
	- 解法：`dayjs.unix(timestamp)`
- **格式化**：`dayjs.unix(timestamp).format('YYYY/MM/DD HH:mm')`
- **計算時間差**：`dayjs().diff(dayjs.unix(timestamp), 'day')`
	- 應用：`days === 0` 今天，`days > 0` 幾天前
- **區間判斷**：  
	```js
	const start = dayjs().startOf('week');
	const end = dayjs().endOf('week');
	date.isAfter(start) && date.isBefore(end)
	```
	- 注意：isAfter/isBefore 不包含等於

---

## 三、陣列處理（map/filter）

- **map**：資料加工（結構轉換）
	```js
	orders.map(order => ({
		...order,
		formattedDate: ...
	}))
	```
- **filter**：條件篩選
	```js
	orders.filter(order => !order.paid)
	```
- **filter 本質**：回傳 boolean

---

## 四、資料驗證（Validation）

- **流程**：輸入資料 → 檢查規則 → 收集錯誤
- **常見寫法**：
	```js
	const errors = [];
	if (!data.name) errors.push('錯誤訊息');
	```
- **正則驗證電話**：`/^09\d{8}$/`
- **統一回傳格式**：
	```js
	{ isValid: boolean, errors: [] }
	```

---

## 五、唯一 ID 生成

- **組合方式**：`'ORD-' + Date.now().toString(36) + Math.random().toString(36).slice(2)`
- **目的**：時間＋隨機，避免重複

---

## 六、axios（API 串接）

- **GET**：`axios.get(url)`
- **POST**：`axios.post(url, { data: {...} })`
- **headers 帶 token**：
	```js
	axios.get(url, { headers: { authorization: token } })
	```

---

## 七、API 分層

- **customer（前台）**：/customer/（產品、購物車）
- **admin（後台）**：/admin/（訂單、管理資料）
- **規則**：admin API 必須帶 ADMIN_TOKEN

---

## 八、錯誤處理（try/catch）

- **正確設計**：API 失敗也要回傳「正確型別」（如：空陣列 []）
- **避免**：`return undefined`
- **原因**：`Array.isArray(undefined)` 會是 false

---

## 九、this 陷阱

- **this = 誰呼叫我**
- **測試環境可能 undefined**
- **安全寫法**：直接用常數（API_PATH、BASE_URL、ADMIN_TOKEN）

---

## 十、OrderService（整合設計）

- **結構**：
	- fetchOrders：拿資料
	- filterUnpaidOrders：篩選
	- formatOrders：加工
- **流程**：fetch → filter → map
- **整合函式**：
	```js
	async getUnpaidOrdersFormatted() {
		const orders = await this.fetchOrders();
		const unpaid = this.filterUnpaidOrders(orders);
		return this.formatOrders(unpaid);
	}
	```

---

## 十一、fetch vs axios

- fetch 需 .json()，axios 自動轉換
- fetch 不會進 catch，axios 會
- axios 語法簡單、功能完整

---

## 十二、這週核心能力

- API 串接
- 資料流處理
- 錯誤設計
- 模組化思維

---

## 一句話總結

> 把「後端資料」轉成「前端可用的乾淨資料」

---

這份筆記可直接作為複習、面試自我介紹時的「專案流程講解」使用。如果需要「面試講解版」或更進階的專案包裝，隨時告訴我！




