async function getLastResults(){

let res = await fetch("https://660071.com/#/home/AllLotteryGames/K3?typeId=9")
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

}
