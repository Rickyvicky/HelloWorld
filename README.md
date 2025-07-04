# 客户资产总结报告 HTML 页面

## 功能特性

- 📊 **资产诊断展示**: 显示持仓金额、收益率、产品数量等关键指标
- 📈 **收益率曲线图**: 使用 Chart.js 展示组合收益率走势
- 🎨 **美观界面**: 参考提供的资产报告图片设计，专业的金融报告样式
- 🖨️ **打印功能**: 一键打印为PDF并保存到本地
- 📱 **响应式设计**: 支持不同屏幕尺寸的设备

## 使用方法

1. **直接打开**: 在浏览器中打开 `asset_report.html` 文件
2. **查看报告**: 页面会自动加载示例数据并展示完整的资产报告
3. **打印报告**: 点击右上角的"打印报告"按钮即可打印或保存为PDF

## 数据接口说明

页面设计支持两个数据接口：

### 接口1: 资产总结诊断
```javascript
{
    "returnCode": "SUC0000",
    "errorMsg": null,
    "body": {
        "amount": 12.34,           // 持仓金额
        "holdYield": 12.34,        // 持仓收益率(已乘100)
        "holdEarning": 12.34,      // 持仓收益
        "holdProductNumber": 4,     // 持仓产品数量
        "performanceSummary": "...", // 业绩总结文本
        "assetDiagnosis": [...],    // 资产类别诊断
        "styleDiagnosis": [...],    // 投资风格诊断
        "fixIncomeSummary": "...",  // 固收基金总结
        "stockSummary": "...",      // 权益基金总结
        "homogeneitySummary": "..." // 同质化基金总结
    }
}
```

### 接口2: 收益率曲线
```javascript
{
    "returnCode": "SUC0000",
    "errorMsg": null,
    "body": {
        "trend": [...],           // 收益率趋势数据
        "mddStartDate": "2025-01-01", // 最大回撤开始日期
        "mddEndDate": "2025-02-01",   // 最大回撤结束日期
        "mdd": 13.05              // 最大回撤幅度(已乘100)
    }
}
```

## 自定义数据

如果您需要使用实际的接口数据，可以修改 HTML 文件中的 JavaScript 部分：

1. 将 `sampleData1` 和 `sampleData2` 替换为实际的 API 调用
2. 修改 `loadData()` 函数以处理实际的数据加载逻辑

## 技术栈

- HTML5 + CSS3
- JavaScript (ES6+)
- Chart.js (图表库)
- 响应式网格布局
- CSS Grid 和 Flexbox

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
