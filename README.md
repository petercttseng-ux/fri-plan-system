# 水試所科技計畫資訊系統

**農業部水產試驗所 科技計畫資訊系統**  
Taiwan Fisheries Research Institute — Technology Plan Information System

## 🌐 線上系統
> 部署於 GitHub Pages，可直接瀏覽使用

## 功能特色

- 🔍 **年度查詢**：支援114年（2025）及115年（2026）科技計畫
- 📋 **計畫資訊**：自動展示計畫名稱、執行單位、主持人、經費、主要目標
- 🔧 **工作說明**：主要工作項目及實施方法詳細列示
- 🏆 **研究成果**：重要研究成果（含統計圖表）
- 🖨️ **列印功能**：一鍵列印查詢結果
- 📥 **PDF下載**：自動儲存為PDF格式下載

## 系統架構

```
fri-plan-system/
├── index.html      # 主頁面
├── style.css       # 樣式表（海洋藍色調設計）
├── app.js          # 應用程式邏輯
├── data/
│   └── plans.js    # 科技計畫資料庫
└── assets/
    └── fri_logo.jpg  # 水試所Logo
```

## 技術棧

- **前端**：Pure HTML5 / CSS3 / JavaScript（ES6+）
- **圖表**：Chart.js 4.x
- **PDF**：html2pdf.js
- **字型**：Google Fonts（Noto Sans TC / Inter）
- **部署**：GitHub Pages

## 版本資訊

- 版本：v2.0
- 更新日期：2026年5月
- 開發單位：農業部水產試驗所 主秘室
