// ========================================
// 第七週作業：使用第三方套件優化電商系統
// 執行方式：npm install && node homework.js
// ========================================

// 載入環境變數與套件
require('dotenv').config({ path: '.env' });
const dayjs = require('dayjs');
const axios = require('axios');

// API 設定（從 .env 讀取）
const API_PATH = process.env.API_PATH;
const BASE_URL = 'https://livejs-api.hexschool.io';
const ADMIN_TOKEN = process.env.API_KEY;

// ========================================
// 任務一：日期處理 - dayjs
// ========================================

/**
 * 1. 將 Unix timestamp 轉換為可讀日期
 * @param {number} timestamp - Unix timestamp（秒）
 * @returns {string} - 格式 'YYYY/MM/DD HH:mm'，例如 '2024/01/01 08:00'
 */
function formatOrderDate(timestamp) {
  // 請實作此函式
  // 提示：dayjs.unix(timestamp).format('YYYY/MM/DD HH:mm')
  return dayjs.unix(timestamp).format('YYYY/MM/DD HH:mm');
}

// * timestamp 是「秒」
// * 但 dayjs() 預設吃的是「毫秒」，所以不能直接 dayjs(timestamp)，要用 dayjs.unix(timestamp)



//-------------------------


/**
 * 2. 計算訂單距今幾天
 * @param {number} timestamp - Unix timestamp（秒）
 * @returns {string} - 例如 '3 天前' 或 '今天'
 */
function getDaysAgo(timestamp) {
  // 請實作此函式
  // 提示：
  // 1. 用 dayjs() 取得今天
  // 2. 用 dayjs.unix(timestamp) 取得訂單日期
  // 3. 用 .diff() 計算天數差異
  const today = dayjs();
  const orderDate = dayjs.unix(timestamp); //這裡的 timestamp 是秒，所以要用unix() 會自動把秒轉成毫秒給 dayjs 使用
  const diffDays = today.diff(orderDate, 'day'); //diff() 的第一個參數是要比較的日期，第二個參數是要比較的單位，這裡是 'day'，會回傳兩個日期相差幾天

  if (diffDays === 0) { //如果訂單日期和今天是同一天，則回傳「今天」
    return '今天';
  } else { //否則回傳「X 天前」
    return `${diffDays} 天前`;
  }
  //三元運算子寫法：
  //return diffDays === 0 ? '今天' : `${diffDays} 天前`; 
}




//-------------------------





/**
 * 3. 判斷訂單是否超過 7 天（可能需要催付款）
 * @param {number} timestamp - Unix timestamp（秒）
 * @returns {boolean} - 超過 7 天回傳 true
 */
function isOrderOverdue(timestamp) {
  // 請實作此函式
  // 提示：
  // 1. 用 dayjs() 取得今天
  // 2. 用 dayjs.unix(timestamp) 取得訂單日期
  // 3. 用 .diff() 計算天數差異，超過 7 天回傳 true
  const today = dayjs();
  const orderDate = dayjs.unix(timestamp);
  const diffDays = today.diff(orderDate, 'day');
  return diffDays > 7; //如果天數差異大於 7 天，則回傳 true
}


//-------------------------



/**
 * 4. 取得本週的訂單
 * @param {Array} orders - 訂單陣列，每筆訂單有 createdAt 欄位
 * @returns {Array} - 篩選出 createdAt 在本週的訂單
 */
function getThisWeekOrders(orders) {
  // 請實作此函式
  // 提示：
  // 1. 用 dayjs().startOf('week') 取得本週開始
  // 2. 用 dayjs().endOf('week') 取得本週結束
  // 3. 用 .isBefore() 和 .isAfter() 判斷
  const startOfWeek = dayjs().startOf('week');//startOf('week') 會回傳本週的第一天，預設是星期日
  const endOfWeek = dayjs().endOf('week');//endOf('week') 會回傳本週的最後一天，預設是星期六

  // 從一堆訂單中，挑出符合條件的訂單，用 filter() 來篩選，條件是訂單的 createdAt 在本週的開始和結束之間
  return orders.filter(order => {
    const orderDate = dayjs.unix(order.createdAt); //把訂單的 createdAt 轉成 dayjs 物件，因為 createdAt 是秒，所以要用 unix() 來轉換
    return orderDate.isAfter(startOfWeek) && orderDate.isBefore(endOfWeek); //如果訂單日期在本週的開始和結束之間，則回傳 true，表示這筆訂單是本週的訂單
  })
}

// filter 的本質是：return ture / false ，條件本身就已經是 boolean，所以不需要再用if或三元運算子來回傳 true / false，直接回傳條件就好
//isAfter(startOfWeek) 不會包含等於的情況，因為 isAfter() 為嚴格大於（>），若訂單時間剛好等於本週開始時間，會被排除。



// ========================================
// 任務二：資料驗證（原生 JS 實作）
// ========================================

/**
 * 1. 驗證訂單使用者資料
 * @param {Object} data - { name, tel, email, address, payment }
 * @returns {Object} - { isValid: boolean, errors: string[] }
 *
 * 驗證規則：
 * - name: 不可為空
 * - tel: 必須是 09 開頭的 10 位數字
 * - email: 必須包含 @ 符號
 * - address: 不可為空
 * - payment: 必須是 'ATM', 'Credit Card', 'Apple Pay' 其中之一
 */
function validateOrderUser(data) {
  // 請實作此函式
  const errors = [];

  if (!data.name) { //!data.name 是用來檢查 name 是否為空，如果 name 是空字串、null 或 undefined，則會回傳 false，進入 if 區塊，加入錯誤訊息
    errors.push('姓名不可為空');
  }
  if (!data.tel || !/^09\d{8}$/.test(data.tel)) { //!/^09\d{8}$/.test(data.tel) 是用正規表達式來檢查電話號碼是否符合 09 開頭的 10 位數字格式，如果不符合就回傳 false，然後進入 if 區塊，加入錯誤訊息
    errors.push('電話必須是 09 開頭的 10 位數字');
  }
  if (!data.email || !/@/.test(data.email)) { //!/@/.test(data.email) 是用正規表達式來檢查 email 是否包含 @ 符號，如果不包含就回傳 false，然後進入 if 區塊，加入錯誤訊息
    errors.push('電子郵件必須包含 @ 符號');
  }
  if (!data.address) { //!data.address 是用來檢查地址是否為空，如果地址是空字串、null 或 undefined，則會回傳 false，進入 if 區塊，加入錯誤訊息
    errors.push('地址不可為空');
  }
  if (!['ATM', 'Credit Card', 'Apple Pay'].includes(data.payment)) { //!['ATM', 'Credit Card', 'Apple Pay'].includes(data.payment) 是用來檢查付款方式是否在指定的選項中，如果不在就回傳 false，進入 if 區塊，加入錯誤訊息
    errors.push('付款方式必須是 ATM、Credit Card 或 Apple Pay');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}


//-------------------------



/**
 * 2. 驗證購物車數量
 * @param {number} quantity - 數量
 * @returns {Object} - { isValid: boolean, error?: string }
 *
 * 驗證規則：
 * - 必須是正整數
 * - 不可小於 1
 * - 不可大於 99
 */
function validateCartQuantity(quantity) {
  // 請實作此函式
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) { //Number.isInteger(quantity) 是用來檢查 quantity 是否為整數，如果不是整數就回傳 false，進入 if 區塊，回傳驗證失敗的物件 || quantity < 1 是用來檢查 quantity 是否小於 1，如果小於 1 就回傳 false，進入 if 區塊，回傳驗證失敗的物件 || quantity > 99 是用來檢查 quantity 是否大於 99，如果大於 99 就回傳 false，進入 if 區塊，回傳驗證失敗的物件
    return {
      isValid: false,
      error: '數量必須是 1 到 99 的正整數'
    };
  }
  return { isValid: true }; //如果 quantity 是有效的數量，則回傳驗證成功的物件
}

// ========================================
// 任務三：唯一識別碼（原生 JS 實作）
// ========================================

/**
 * 1. 產生訂單編號
 * @returns {string} - 格式 'ORD-xxxxxxxx'
 */
function generateOrderId() {
  // 請實作此函式
  // 提示：可以用 Date.now().toString(36) + Math.random().toString(36).slice(2)
  return `ORD-${Date.now().toString(36) + Math.random().toString(36).slice(2)}`;//使用 Date.now() 產生時間唯一性，搭配 Math.random() 增加隨機亂碼，上面兩者皆透過 toString(36) 轉為英數字串（0-9 + a-z），讓數值變短且更適合作為 ID，其中 Math.random() 轉換後會包含 "0."，因此使用 slice(2) 去除前綴，最後將時間字串與隨機字串組合，形成不易重複的訂單 ID。

}


//------------------------



/**
 * 2. 產生購物車項目 ID
 * @returns {string} - 格式 'CART-xxxxxxxx'
 */
function generateCartItemId() {
  // 請實作此函式
  // 提示：同上，但前綴改為 'CART-'
  return `CART-${Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
}





// ========================================
// 任務四：使用 Axios 串接 API
// ========================================

/**
 * 1. 取得產品列表（使用 Axios）
 * @returns {Promise<Array>} - 回傳 products 陣列
 */
async function getProductsWithAxios() {
  // 請實作此函式
  // 提示：axios.get() 會自動解析 JSON，不需要 .json()
  // 回傳 response.data.products
  try {
    const response = await axios.get(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`);
    return response.data.products; //axios 會自動把回傳的 JSON 解析成物件，所以直接回傳 response.data.products 就好，不需要再用 .json() 來解析一次
  } catch (error) {
    console.error('取得產品列表失敗:', error.message);
    return undefined; //如果發生錯誤，回傳 undefined
  }
}


//-------------------------



/**
 * 2. 加入購物車（使用 Axios）
 * @param {string} productId - 產品 ID
 * @param {number} quantity - 數量
 * @returns {Promise<Object>} - 回傳購物車資料
 */
async function addToCartWithAxios(productId, quantity) {
  // 請實作此函式
  // 提示：axios.post(url, data) 會自動設定 Content-Type
  try {
    const response = await axios.post(`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`, {
      data: { //根據 API 文件，加入購物車的資料需要放在 data 物件裡面
        productId,
        quantity
      }
    });
    return response.data; //回傳購物車資料
  } catch (error) {
    console.error('加入購物車失敗:', error.message);
    return undefined; //如果發生錯誤，回傳 undefined
  }
}


//-------------------------



/**
 * 3. 取得訂單（使用 Axios，需認證）
 * @returns {Promise<Array>} - 回傳訂單陣列
 */
async function getOrdersWithAxios() {
  // 請實作此函式
  // 提示：axios.get(url, { headers: { authorization: token } })
  try {
    const response = await axios.get(`${BASE_URL}/api/livejs/v1/admin/${API_PATH}/orders`, {
      headers: {
        authorization: ADMIN_TOKEN //根據 API 文件，取得訂單需要在 headers 裡面帶上 authorization 欄位，值為 ADMIN_TOKEN
      }
    });
    return response.data.orders; //回傳訂單陣列
  }
  catch (error) {
    console.error('取得訂單失敗:', error.message);
    return []; //如果發生錯誤，回傳空陣列，保持回傳型別一致
  }
}

/*
比較題：請說明 fetch 和 axios 的主要差異

1. JSON 處理
   fetch 需要手動呼叫 .json() 來解析 JSON 回應，而 axios 會自動解析 JSON，直接回傳物件。

2. 錯誤處理
   fetch 需要手動檢查 response.ok 來判斷是否成功，而 axios 會自動拋出錯誤，方便使用 try/catch 捕捉。

3. 語法 / 使用便利性
   axios 提供了更簡潔的語法，尤其是在設定 headers、攜帶資料等方面更方便，而 fetch 需要更多的程式碼來達成相同的功能。

*/

// ========================================
// 任務五：整合應用 (挑戰)
// ========================================

/**
 * 建立一個完整的「訂單服務」物件
 */
const OrderService = {
  apiPath: API_PATH,
  baseURL: BASE_URL,
  token: ADMIN_TOKEN,

  /**
   * 使用 axios 取得訂單
   * @returns {Promise<Array>} - 訂單陣列
   */
  async fetchOrders() {
    // 請實作此函式
    try {
      const res = await axios.get(`${BASE_URL}/api/livejs/v1/admin/${API_PATH}/orders`, {
        headers: { //axios 的第二個參數可以用來設定 headers是用來帶上認證 token 的，這裡寫authorization: this.token，表示在 headers 裡面帶上 authorization 欄位，值為 this.token，也就是 ADMIN_TOKEN
          authorization: ADMIN_TOKEN,
        }
      });
      return res.data.orders; //回傳訂單陣列
    } catch (error) {
      console.error('取得訂單失敗:', error.message);
      return []; // API 層不要讓型別亂掉，成功 → 回傳 array，失敗 → 也回傳 array（空的）
    }
  },

  /**
   * 使用 dayjs 格式化訂單日期
   * @param {Array} orders - 訂單陣列
   * @returns {Array} - 為每筆訂單加上 formattedDate 欄位
   */
  formatOrders(orders) {
    // 請實作此函式
    return orders.map(order => ({
      ...order,
      formattedDate: dayjs.unix(order.createdAt).format('YYYY/MM/DD HH:mm')
    })); //使用 map() 方法遍歷 orders 陣列，為每筆訂單加上 formattedDate 欄位，值為使用 dayjs.unix(order.createdAt).format('YYYY/MM/DD HH:mm') 格式化後的日期字串
  },

  /**
   * 篩選未付款訂單
   * @param {Array} orders - 訂單陣列
   * @returns {Array} - paid: false 的訂單
   */
  filterUnpaidOrders(orders) {
    // 請實作此函式
    return orders.filter(order => !order.paid); //使用 filter() 方法篩選出 paid 為 false 的訂單
  },

  /**
   * 驗證訂單使用者資料
   * @param {Object} userInfo - 使用者資料
   * @returns {Object} - 驗證結果
   */
  validateUserInfo(userInfo) {
    return validateOrderUser(userInfo);
  },

  /**
   * 整合：取得未付款訂單，並格式化日期
   * @returns {Promise<Array>} - 格式化後的未付款訂單
   */
  async getUnpaidOrdersFormatted() {
    const orders = await this.fetchOrders(); //先取得訂單
    const unpaid = this.filterUnpaidOrders(orders); //取得未付款訂單
    return this.formatOrders(unpaid); //先取得未付款訂單，再篩選出 paid 為 false 的訂單，最後再格式化日期
  }
};

// ========================================
// 匯出函式供測試使用
// ========================================
module.exports = {
  API_PATH,
  BASE_URL,
  ADMIN_TOKEN,
  formatOrderDate,
  getDaysAgo,
  isOrderOverdue,
  getThisWeekOrders,
  validateOrderUser,
  validateCartQuantity,
  generateOrderId,
  generateCartItemId,
  getProductsWithAxios,
  addToCartWithAxios,
  getOrdersWithAxios,
  OrderService
};

// ========================================
// 直接執行測試
// ========================================
if (require.main === module) {
  // 測試資料
  const testOrders = [
    { id: 'order-1', createdAt: Math.floor(Date.now() / 1000) - 86400 * 3, paid: false },
    { id: 'order-2', createdAt: Math.floor(Date.now() / 1000) - 86400 * 10, paid: true },
    { id: 'order-3', createdAt: Math.floor(Date.now() / 1000), paid: false }
  ];

  async function runTests() {
    console.log('=== 第七週作業測試 ===\n');
    console.log('API_PATH:', API_PATH);
    console.log('');

    // 任務一測試
    console.log('--- 任務一：dayjs 日期處理 ---');
    const timestamp = 1704067200;
    console.log('formatOrderDate:', formatOrderDate(timestamp));
    console.log('getDaysAgo:', getDaysAgo(testOrders[0].createdAt));
    console.log('isOrderOverdue:', isOrderOverdue(testOrders[1].createdAt));
    console.log('getThisWeekOrders:', getThisWeekOrders(testOrders)?.length, '筆');

    // 任務二測試
    console.log('\n--- 任務二：資料驗證 ---');
    const validUser = {
      name: '王小明',
      tel: '0912345678',
      email: 'test@example.com',
      address: '台北市信義區',
      payment: 'Credit Card'
    };
    console.log('validateOrderUser (valid):', validateOrderUser(validUser));

    const invalidUser = {
      name: '',
      tel: '1234',
      email: 'invalid',
      address: '',
      payment: 'Bitcoin'
    };
    console.log('validateOrderUser (invalid):', validateOrderUser(invalidUser));

    console.log('validateCartQuantity (5):', validateCartQuantity(5));
    console.log('validateCartQuantity (0):', validateCartQuantity(0));

    // 任務三測試
    console.log('\n--- 任務三：ID 產生 ---');
    console.log('generateOrderId:', generateOrderId());
    console.log('generateCartItemId:', generateCartItemId());

    // 任務四測試
    if (API_PATH) {
      console.log('\n--- 任務四：Axios API 串接 ---');
      try {
        const products = await getProductsWithAxios();
        console.log('getProductsWithAxios:', products ? `成功取得 ${products.length} 筆產品` : '回傳 undefined');
      } catch (error) {
        console.log('getProductsWithAxios 錯誤:', error.message);
      }
    } else {
      console.log('\n--- 任務四：請先在 .env 設定 API_PATH ---');
    }

    console.log('\n=== 測試結束 ===');
    console.log('\n提示：執行 node test.js 進行完整驗證');
  }

  runTests();
}
