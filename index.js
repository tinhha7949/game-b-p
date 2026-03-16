import fetch from "node-fetch"

const BOT_TOKEN="BOT_TOKEN"
const CHAT_ID="CHAT_ID"

let lastResult=null

async function sendTelegram(text){

await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({
chat_id:CHAT_ID,
text:text
})
})

}

async function getResults(){

try{

let res=await fetch("LINK_API_KET_QUA_WEB")

let data=await res.json()

return data

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

let sorted=Object.entries(score)
.filter(x=>x[0]>=6 && x[0]<=15)
.sort((a,b)=>b[1]-a[1])

let top4=sorted.slice(0,4).map(x=>x[0])
let top2=sorted.slice(0,2).map(x=>x[0])

let msg=`
🎲 KẾT QUẢ MỚI

5 KQ gần nhất:
${last5.join(", ")}

Cửa dự đoán:
${big>small?"LỚN":"NHỎ"}
${even>odd?"CHẴN":"LẺ"}

🔥 4 số mạnh:
${top4.join(", ")}

⭐ 2 số mạnh nhất:
${top2.join(", ")}
`

return msg

}

async function main(){

console.log("Bot đang chạy...")

setInterval(async()=>{

let data=await getResults()

if(data.length<5) return

let last=data[0]

if(last===lastResult) return

lastResult=last

let msg=analyze(data)

await sendTelegram(msg)

},5000)

}

main()
