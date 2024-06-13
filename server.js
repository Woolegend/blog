require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const { MongoClient } = require('mongodb')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { v1, v3, v4, v5 } = require('uuid')
const { fileLoader } = require('ejs')
const s3 = new S3Client({
    region: process.env.AWS_S3_REGION || "",
    credentials: {
        accessKeyId: process.env.AWS_S3_KEY || "",
        secretAccessKey: process.env.AWS_S3_SECRET || ""
    }
})
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        key: function (req, file, cb) {
            cb(null, Date.now().toString()) //업로드시 파일명 변경가능
        }

    })
})

const uploadObject = async (data) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: Date.now().toString(),
        Body: data,
        ACL: "public-read"
    });

    try {
        const response = await s3.send(command);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
};


app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.set('views', './views');
app.use(express.json({
    limit: "3mb"
}))
app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize())
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}))

app.use(passport.session())

let mongoDB;
new MongoClient(process.env.MongoDB_URL).connect()
    .then((client) => {
        console.log('MongoDB 연결성공')
        mongoDB = client.db('blog')

        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT} 에서 서버 실행중`)
        })
    }).catch((err) => {
        console.log(err)
    })

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    let data = req.body
    let user = await mongoDB.collection('user').findOne({ username: data.username })

    if (data.type === 'login') {
        if (!user) return res.send('존재하지 않는 아이디라능!')
    } else if (data.type === 'create') {
        if (user) return res.send('이미 존재하는 아이디라능~')
        else {
            return res.send('가입됐다능~')
        }
    }
})

app.get('/forgot', (req, res) => {
    res.send('힘내렴')
})

app.get('/write', (req, res) => {
    res.render('write')
})

app.post('/save-post', async (req, res) => {
    let { title, tag, delta, html } = req.body
    await mongoDB.collection('post').insertOne({
        username : "admin",
        title : title,
        tag : tag,
        delta : delta,
        html : html,
        data : new Date()
    })
    res.json({ state : "success" });
})

app.get('/list/:tag', async(req, res) => {

})