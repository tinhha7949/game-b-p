import fetch from "node-fetch"
import * as cheerio from "cheerio"

const TOKEN = "BOT_TOKEN"
const CHAT_ID = "CHAT_ID"

let lastResult = null

async function sendTelegram(msg){

await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
chat_id:CHAT_ID,
text:msg
})
})

}

async function getLastResults(){

try{

let res = await fetch("https://660071.com/#/home/AllLotteryGames/K3?typeId=9",{
headers:{
"user-agent":"Mozilla/5.0"
}
})

let html = await res.text()

const $ = cheerio.load(html)

let arr=[]

$(".van-row .van-col--1 span").each((i,el)=>{

let num=$(el).text().trim()

let n=parseInt(num)

if(!isNaN(n) && n>=3 && n<=18){
arr.push(n)
}

})

return arr

}catch(e){

console.log("Lỗi lấy dữ liệu:",e)
return []

}

}

function predict(data){

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
if(freq[n]!==undefined){
freq[n]++
}
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

return {
last:last5[0],
big,
small,
even,
odd,
top4,
top2
}

}

async function run(){

let data=await getLastResults()

if(data.length<5){
console.log("Chưa có dữ liệu...")
return
}

let result=predict(data)

if(result.last!==lastResult){

lastResult=result.last

let msg=
`KQ MỚI: ${result.last}

LỚN:${result.big}  NHỎ:${result.small}
CHẴN:${result.even}  LẺ:${result.odd}

🔥 4 SỐ: ${result.top4.join(" - ")}

⭐ 2 SỐ MẠNH: ${result.top2.join(" - ")}`

console.log(msg)

sendTelegram(msg)

}

}

console.log("Bot đang chạy...")

setInterval(run,5000)
