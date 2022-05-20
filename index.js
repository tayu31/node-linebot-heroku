const https = require("https")
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000
//const TOKEN = process.env.LINE_ACCESS_TOKEN
//はherokuのsetで入れたトークン
const TOKEN = process.env.ACCESS_TOKEN

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

app.get("/", (req, res) => {
  res.sendStatus(200)
})

app.post("/hook", function(req, res) {
  res.send("HTTP POST request sent to the webhook URL!")
  if(req.body.events[0].type === "message"){
    //dataStringで文字列化
    const dataString = JSON.stringify({
      replyToken: req.body.event[0].replyToken,
      message:[
        {
          "type": "text",
          "text": "Hello, user"
        },
        {
          "type": "text",
          "text": "May I help you?"
        }
      ]
    })


    //HTTPリクエストヘッダのことで「お願い事」や「お願いする人のセキュリティ等が書いてある場所」
    //リクエストライン(POST,get する場所)とメッセージボディ(補足事項)もある
    const headers = {
      //公式ドキュメントにしたのはかいてあった。
      //https://developers.line.biz/ja/reference/messaging-api/#send-reply-message
      //https://wa3.i-3-i.info/word1844.html
      "Content-Type": "application/json",
      "Authorization": "Bearer" + TOKEN//5行目のやつ
    }


    //下のはNode.jsの公式リファレンスを参照して作られているみたい。
    const webhookOptions = {
      "hostname": "api.line.me",
      "path": "v2/bot/message/reply",
      "method": "POST",
      "headers": headers,
      "body": dataString
    }
  //リクエストの定義
  const request = http.request(webhookOptions, (res)=>{
    //res.onは受け取るのでdataを受け取る。
    //反対は、res.emit(data, ()=>{})
    res.on("data", (d)=>{
      process.stdout.write(d)
      /*
      process.stdout.writeの参考URL
      https://www.geeksforgeeks.org/node-js-process-stdout-property/#:~:text=The%20process.stdout%20property%20is%20an%20inbuilt%20application%20programming,to%20stdout.%20It%20implements%20a%20write%20%28%29%20method.

      これの例を以下に乗せるまた、console.log()との違いは新しい行を開けないこと。
      process.stdout.write("Geeks");
      process.stdout.write("for");
      process.stdout.write("Geeks");

      結果
      GeeksforGeeks
      */
    })
  })

  //エラーをコールバックしてくれている。
  //request.onは、APIサーバーへのリクエスト送信時にエラーが発生した場合
  request.on("error", (err)=>{
    console.log(err)
  })


  //データを送信
  request.write(dataString)
  request.end()
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})