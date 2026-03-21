const Parser = require("rss-parser")
const parser = new Parser()

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

let sentNews = new Set()

// ================= TELEGRAM =================
async function sendTelegram(msg){
    try{
        let url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
        await fetch(url,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
        })
    }catch(e){
        console.log("❌ TELE:", e.message)
    }
}

// ================= FILTER =================
function analyzeNews(title){

    let t = title.toLowerCase()

    let tag = "📈 STOCK"

    // 🏦 Vĩ mô mạnh
    if(
        t.includes("fed") || t.includes("fomc") ||
        t.includes("cpi") || t.includes("inflation") ||
        t.includes("lãi suất") || t.includes("interest rate")
    ){
        tag = "🏦 MACRO"
    }

    // 🌍 Địa chính trị
    else if(
        t.includes("war") || t.includes("trung quốc") ||
        t.includes("china") || t.includes("russia")
    ){
        tag = "🌍 GEO"
    }

    // 🛢️ Hàng hóa
    else if(
        t.includes("oil") || t.includes("dầu") ||
        t.includes("gold") || t.includes("vàng") ||
        t.includes("usd") || t.includes("dollar")
    ){
        tag = "🛢️ COMMODITY"
    }

    // 📊 Thị trường
    else if(
        t.includes("nasdaq") ||
        t.includes("dow jones") ||
        t.includes("s&p") ||
        t.includes("vnindex") ||
        t.includes("vn-index")
    ){
        tag = "📊 MARKET"
    }

    // ❌ lọc rác
    let isImportant =
        t.includes("chứng khoán") ||
        t.includes("cổ phiếu") ||
        t.includes("vnindex") ||
        t.includes("fed") ||
        t.includes("cpi") ||
        t.includes("inflation") ||
        t.includes("lãi suất") ||
        t.includes("nasdaq") ||
        t.includes("dow jones") ||
        t.includes("oil") ||
        t.includes("gold") ||
        t.includes("usd") ||
        t.includes("war") ||
        t.includes("china")

    return { isImportant, tag }
}

// ================= FETCH =================
async function fetchNews(){

    console.log("📰 Checking NEWS...")

    try{

        let feeds = [
            // 🇻🇳 Việt Nam
            "https://vnexpress.net/rss/kinh-doanh.rss",
            "https://cafef.vn/thi-truong-chung-khoan.rss",

            // 🌍 Quốc tế mạnh
            "https://feeds.bloomberg.com/markets/news.rss",
            "https://www.investing.com/rss/news_25.rss",
            "https://www.cnbc.com/id/100003114/device/rss/rss.html"
        ]

        for(let url of feeds){

            let feed = await parser.parseURL(url)

            for(let item of feed.items.slice(0,5)){

                let id = item.link
                if(sentNews.has(id)) continue

                let { isImportant, tag } = analyzeNews(item.title)

                if(!isImportant) continue

                sentNews.add(id)

                let msg = `${tag} NEWS

📰 ${item.title}

🔗 ${item.link}`

                console.log(msg)
                await sendTelegram(msg)
            }
        }

    }catch(e){
        console.log("❌ NEWS:", e.message)
    }
}

// ================= LOOP =================
setInterval(fetchNews, 600000) // 10 phút
fetchNews()
