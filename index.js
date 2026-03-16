const fetch=require("node-fetch")
const TelegramBot=require("node-telegram-bot-api")
const cheerio=require("cheerio")

const BOT_TOKEN="TOKEN_BOT"
const CHAT_ID="CHAT_ID"

const bot=new TelegramBot(BOT_TOKEN,{polling:false})

let lastResult=null

async function sendTelegram(msg){

await bot.sendMessage(CHAT_ID,msg)

}

async function getLastResults(){

try{

let res=await fetch("LINK_WEB_KET_QUA")
let html=await res.text()

const $=cheerio.load(html)

let arr=[]

$(".van-row").each((i,el)=>{

let text=$(el).text().trim().split("\n")

if(text.length>=2){

let n=parseInt(text[1])

if(!isNaN(n)&&n>=3&&n<=18){
arr.push(n)
}

}

})

return arr

}catch(e){

return []

}

}

function analyze(data){

let last5=data.slice(0,5)
let last300=data.slice(0,300)

let big=last300.filter(x=>x>=11).length
let small=last300.filter(x=>x<=10).length

let even=last300.filter(x=>x%2==0).length
let odd=last300.filter(x=>x%2==1).length

let freq={}
let score={}

for(let i=3;i<=18;i++){
freq[i]=0
score[i]=0
}

last300.forEach(n=>{
if(freq[n]!=undefined) freq[n]++
})

for(let i=6;i<=15;i++){

score[i]+=freq[i]*2

if(big>small && i>=11) score[i]+=3
if(small>big && i<=10) score[i]+=3

if(even>odd && i%2==0) score[i]+=2
if(odd>even && i%2==1) score[i]+=2

if(!last5.includes(i)) score[i]+=1

}

let sortedScore=Object.entries(score)
.filter(x=>x[0]>=6 && x[0]<=15)
.sort((a,b)=>b[1]-a[1])

let top4=sortedScore.slice(0,4).map(x=>x[0])
let top2=sortedScore.slice(0,2).map(x=>x[0])

let msg=`
🎲 KẾT QUẢ MỚI

5 KQ gần nhất:
${last5.join(",")}

Cửa:
${big>small?"LỚN":"NHỎ"}
${even>odd?"CHẴN":"LẺ"}

🔥 4 số mạnh:
${top4.join(",")}

⭐ 2 số mạnh nhất:
${top2.join(",")}
`

return msg

}

async function main(){

console.log("BOT đang chạy...")

setInterval(async()=>{

let data=await getLastResults()

if(data.length<5) return

let newest=data[0]

if(newest===lastResult) return

lastResult=newest

let msg=analyze(data)

await sendTelegram(msg)

},5000)

}

main()
