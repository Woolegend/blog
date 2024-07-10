require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const { S3Client, DeleteObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const bcrypt = require('bcrypt')
const MongoStore = require('connect-mongo');

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
    });

    try {
        const response = await s3.send(command);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

const tags = ["algorithm", "htmlcss", "javascript", "nodejs", "react"]

// app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname + '/public')))
app.set('view engine', 'ejs')
app.set('views', './views');
app.use(express.json({
    limit: "10mb"
}))
app.use(express.urlencoded({ extended: true }))


app.use(passport.initialize())
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.MongoDB_URL,
        dbName: 'blog'

    })
}))
app.use(passport.session())

// 아이디 비번 검사
passport.use(new LocalStrategy(async (username, password, cb) => {
    try {
        let result = await mongoDB.collection('user').findOne({ username: username })
        if (!result) {
            return cb(null, false, { message: '아이디 DB에 없음' })
        }
        if (await bcrypt.compare(password, result.password)) {
            return cb(null, result)
        } else {
            return cb(null, false, { message: '비밀번호 틀림' })
        }
    } catch (e) {
        console.log(e)
    }
}))

// 세션 생성하는 코드
passport.serializeUser((user, done) => {
    // nodejs 내부 코드를 비동기적으로 처리해준다.
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username })
    })
})

/**
 * 유저가 보낸 쿠키를 분석 해준다.
 * 
 * req.user에 지금 접속한 유저의 정보가 남는다.
 * 
 * serializeUser와
 * deserializeUser 밑에서만 작동하므로
 * 기능 개발 시 유의해야 한다.
 * 
 * @todo redis에 세션 저장하기
 * @todo 특정 라우팅에만 작동시키기
 */
passport.deserializeUser(async (user, done) => {
    // 문제가 없는데 왜 ObjectId에 가로선이 뜨는지 모르겠음
    // 이유는 그냥 권장하지 않는 방식이라 그렇지 오류가 발생하지 않는다.
    let result = await mongoDB.collection('user').findOne({ _id: new ObjectId(user.id) })
    delete result.password
    process.nextTick(() => {
        return done(null, result)
    })
})

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


const checkLogin = (req, res, next) => {
    if (req.user === undefined) {
        return res.status(401).json(
            {
                msg: '로그인 하렴',
                url: '/login'
            }
        )
    }
    return next()
}

const checkTempStorage = async (req, res, next) => {
    let temp = await mongoDB.collection('temp').findOne({ userId: req.user._id })

    if (temp === null) {
        let tempLayout = {
            userId: req.user._id,
            write: { images: [] },
            edit: { images: [] }
        }
        await mongoDB.collection('temp').insertOne(tempLayout)
        return next()
    }

    if (temp.write === undefined) {
        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { write: { images: [] } } }
            )
    } else if (temp.write.images === undefined) {
        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { write: { images: [] } } }
            )
    } else if (temp.write.images.length > 0) {
        let input = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: {
                Objects: temp.write.images
            }
        }
        const command = new DeleteObjectsCommand(input)
        const response = await s3.send(command)
    }

    if (temp.edit === undefined) {
        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { edit: { images: [] } } }
            )
    } else if (temp.edit.images === undefined) {
        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { edit: { images: [] } } }
            )
    } else if (temp.edit.images.length > 0) {
        let input = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: {
                Objects: temp.edit.images
            }
        }
        const command = new DeleteObjectsCommand(input)
        const response = await s3.send(command)
    }
    return next()
}

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res, next) => {
    // const { type, username, password } = req.body
    // console.log(typeof(type), typeof(username), typeof(password))

    // if(typeof(username) !== 'string') 

    passport.authenticate('local', (error, user, info) => {
        if (error) return res.status(500).json(error)
        if (!user) return res.status(401).json(info.message)
        req.logIn(user, (err) => {
            if (err) return next(err)
            res.redirect('/immigration')
        })
    })(req, res, next)
})

app.post('/join', async (req, res) => {

    let hashPassword = await bcrypt.hash(req.body.password, 10)

    /**
     * 신규 가입자 정보
     * 
     * @property { string } username 아이디
     * @property { string } password 비밀번호
     * @property { string } authority 권한
     * 
     * @todo 정보 정규식 검사
     * @todo email등 기타 정보 추가하기
     */
    let newcomer = {
        username: req.body.username,
        password: hashPassword,
        authority: "user"
    }
    const result = await mongoDB.collection('user').insertOne(newcomer)

    res.redirect('/login')
})

app.get('/forgot', (req, res) => {
    res.send('힘내렴')
})

app.get('/immigration', checkTempStorage, async (req, res, next) => {
    return res.redirect('/')
})

/**
 * 지금은 a 태그로 이동하지만
 * 이후 버튼을 통한 동적 이동으로 바꿀거임
 * 클라이언트에서 이동 요청을 보낼 때 서버에서
 * 클라이언트의 정보를 확인하고 이동시킬지 경고를 보낼지 판단할거임
 */
app.get('/write', checkLogin, async (req, res, next) => {
    try {
        let temp = await mongoDB.collection('temp').findOne({ userId: req.user._id })

        if (temp.write === undefined) {
            await mongoDB.collection('temp')
                .updateOne(
                    { userId: req.user._id },
                    { $set: { write: { images: [] } } }
                )
        } else {
            if (temp.write.images.length > 0) {
                let input = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Delete: {
                        Objects: temp.write.images
                    }
                }
                const command = new DeleteObjectsCommand(input)
                const response = await s3.send(command)
            }
        }

        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { write: { images: [] } } }
            )

        return res.render('write')
    } catch (e) {
        return res.send(e)
    }
})

app.post('/write', checkLogin, async (req, res) => {
    try {
        let { title, tag, delta, html, images } = req.body
        let saveImages = [] // 실제 저장할 이미지 모음
        let deleteImages = [] // 실제 사용하지 않은 이미지
        let temp = await mongoDB.collection('temp')
            .findOne(
                { userId: req.user._id }
            )

        if (temp.write === undefined) {
            await mongoDB.collection('temp')
                .updateOne(
                    { userId: req.user._id },
                    { $set: { write: { images: [] } } }
                )
        }

        temp.write.images.forEach(e => {
            let flag = false
            images.some(image => {
                if (e.Key === image) {
                    saveImages.push(e)
                    return flag = true
                }
                return false
            })
            if (!flag) deleteImages.push(e)
        })

        let input = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: {
                Objects: deleteImages
            }
        }
        const command = new DeleteObjectsCommand(input)
        const response = await s3.send(command)

        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { write: { images: [] } } }
            )

        let post = {
            userId: req.user._id,
            username: req.user.username,
            title: title,
            tag: tag,
            delta: delta,
            html: html,
            images: saveImages,
            date: new Date(),
            edit: null
        }

        let result = await mongoDB.collection('post').insertOne(post)
        return res.json(`/detail/${result.insertedId}`)
    } catch (e) {
        return res.send(e)
    }
})

app.get('/list', async (req, res) => {
    res.redirect('/')
})

app.get('/list/:tag', async (req, res) => {
    let tag = req.params.tag

    // 태그가 존재하는지 펀별
    let flag = false
    tags.some((e) => {
        if (e === tag) return flag = true
        else return false
    })

    // 존재하지 않는 태그면 전체 목록으로 이동
    if (!flag) return res.redirect('/list')

    // 존재하는 태그라능
    return res.render('list')
})

app.get('/get/list', async (req, res) => {
    try {
        let listTag = req.query.tag
        let posts = await mongoDB.collection('post').find({ tag: listTag }).project({ username: 1, title: 1, tag: 1, date: 1 }).toArray()
        res.json(posts)
    } catch (e) {
        res.send(e)
    }
})

app.get('/get/post', async (req, res) => {
    let postId = new ObjectId(req.query.id)
    let post = await mongoDB.collection('post').findOne({ _id: postId })
    res.json(post)
})

/***
 * 업로드 하려는 게시물이 본인 게시물이 맞는지 확인 필요
 */
app.post('/upload/image', checkLogin, upload.single('file'), async (req, res) => {
    try {
        const task = req.query.task
        let temp = await mongoDB.collection('temp').findOne({ userId: req.user._id })

        if (task === 'write') {
            let images = temp.write.images
            let length = images.length
            images[length] = { Key: req.file.key }
            await mongoDB.collection('temp').updateOne(
                { userId: req.user._id },
                { $set: { write: { images: images } } }
            )
        } else if (task === 'edit') {
            let images = temp.edit.images
            let length = images.length
            images[length] = { Key: req.file.key }
            await mongoDB.collection('temp').updateOne(
                { userId: req.user._id },
                { $set: { edit: { images: images } } }
            )
        } else {
            let input = {
                Bucket: process.env.AWS_S3_BUCKET,
                Delete: {
                    Objects: [{ Key: req.file.key }]
                }
            }
            const command = new DeleteObjectsCommand(input)
            const response = await s3.send(command)
            return res.send('업로드 실패')
        }

        return res.send({
            key: req.file.key,
            location: req.file.location
        })

    } catch (e) {
        return res.send(e)
    }
})

// reply를 ejs로 보낼지 동적으로 보낼지 고민해봄
app.get('/detail/:id', async (req, res) => {
    try {
        let postId = new ObjectId(req.params.id)
        let post = await mongoDB.collection('post').findOne({ _id: postId })
        let reply = await mongoDB.collection('reply').find({ postId: postId }).toArray()

        return res.render('detail', { post: post, reply: reply })
    } catch (e) {
        console.log(e)
        return res.send('400')
    }
})

// url params
// 경로 문제였다 쉬이벌...
app.get('/edit/:id', checkLogin, async (req, res) => {
    let postId = new ObjectId(req.params.id)
    let post = await mongoDB.collection('post').findOne({ _id: postId })

    if (post.userId.equals(req.user._id)) {
        return res.render('edit')
    } else {
        return res.send('작성자가 다름')
    }
})

app.put('/edit/:id', checkLogin, async (req, res, next) => {
    try {
        const postId = new ObjectId(req.params.id)
        let { title, tag, delta, html, images } = req.body
        let post = await mongoDB.collection('post').findOne({ _id: postId })
        let temp = await mongoDB.collection('temp').findOne({ userId: req.user._id })

        let allImages = [...post.images, ...temp.edit.images]
        console.log(allImages)
        let saveImages = []
        let deleteImages = []

        allImages.forEach(e => {
            let flag = false
            images.some(image => {
                if (e.Key === image) {
                    saveImages.push(e)
                    return flag = true
                } else return false
            })
            if (!flag) deleteImages.push(e)
        })

        let input = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: {
                Objects: deleteImages
            }
        }

        const command = new DeleteObjectsCommand(input)
        const response = await s3.send(command)

        await mongoDB.collection('temp')
            .updateOne(
                { userId: req.user._id },
                { $set: { edit: { images: [] } } }
            )

        const editPost = {
            title: title,
            tag: tag,
            delta: delta,
            html: html,
            images: saveImages,
            edit: new Date()
        }

        await mongoDB.collection('post').updateOne(
            { _id: postId },
            { $set: editPost })

        res.json(`/detail/${postId}`)
    } catch (e) {
        res.send(e)
    }
})

app.delete('/delete/post/:id', checkLogin, async (req, res, next) => {
    try {
        const post = await mongoDB.collection('post').findOne({ _id: new ObjectId(req.params.id) })

        console.log(req.user._id, post.userId)
        if (!req.user._id.equals(post.userId)) {
            return res.status(403).json(
                { msg: "승인되지 않음" }
            )
        }

        const result = await mongoDB.collection('reply').deleteMany({ postId: post._id })

        let input = {
            Bucket: process.env.AWS_S3_BUCKET,
            Delete: {
                Objects: post.images
            }
        }

        const command = new DeleteObjectsCommand(input)
        const response = await s3.send(command)

        res.send('ok')
    } catch (e) {
        return res.send(e)
    }

})

app.get('/user', checkLogin, async (req, res) => {
    let result = await mongoDB.collection('user').findOne({ _id: req.user._id })
    res.render('user', { user: result })
})

app.get('/logout', checkLogin, async (req, res) => {
    req.logout((err) => {
        if (err) return next(err)
        req.session.save(() => {
            res.redirect('/')
        });
    });
});

app.post('/reply', checkLogin, async (req, res) => {
    try {
        if (req.user === undefined) {
            return res.send('로그인 하라능')
        }

        const postId = new ObjectId(req.body.postId)
        let post = await mongoDB.collection('post').findOne({ _id: postId })

        if (post === null) {
            return res.send('없는 게시물이라능')
        }

        const result = await mongoDB.collection('reply')
            .insertOne({
                postId: postId,
                userId: req.user._id,
                username: req.user.username,
                content: req.body.content,
                date: new Date(),
            })
        res.redirect(`/detail/${req.body.postId}`)
    } catch (e) {
        console.error(e);
        res.send(e)
    }

})