// top navigation
const topNavigation = document.querySelector('.top-navigation')
const activeBtn = document.querySelector('.active-btn')
const activeIcon = document.querySelector('.active-btn i')
const unlockIcon = document.querySelector('.fa-unlock')
const lockIcon = document.querySelector('.fa-lock')
const deleteBtn = document.querySelector('.delete-btn')
const editBtn = document.querySelector('.edit-btn')

// comment
const commentForm = document.querySelector('.comment-form')
const commentInput = document.querySelector('.comment-input')
const commentBtn = document.querySelector('.comment-btn')
const loginBtn = document.querySelector('.alert-info button')

// emoticon
const emoticonBtn = document.querySelector('.emoticon-btn')
const emoticonInput = document.querySelector('.emoticon-input')
const emoticonContent = document.querySelector('.emoticon-content')

//meta data
const authority = document.querySelector('#authority').value
const postId = document.querySelector('#post-id').value
const isLogin = document.querySelector('#is-login').value
let access = document.querySelector('#access').value

// comment form height styled
commentInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// logout alert href
loginBtn.addEventListener('click', function () {
    location.href = `/login?goto=/detail/${postId}`
})

// show comment form when user log in
if (isLogin === 'true') {
    document.querySelector('.alert-info').style.display = 'none'
} else {
    document.querySelector('.comment-input-wrapper').style.display = 'none'
}

// post edit authority
if (authority === "allowed") {

    if (access === 'public') {
        unlockIcon.style.color = 'black'
        lockIcon.style.color = 'grey'
    } else if (access === 'private') {
        unlockIcon.style.color = 'grey'
        lockIcon.style.color = 'black'
    }

    activeBtn.addEventListener('click', async function () {
        if (access === 'public') {
            access = "private"
            activeIcon.classList.add('deactive')
            unlockIcon.style.color = 'grey'
            lockIcon.style.color = 'black'
        } else if (access === 'private') {
            access = "public"
            activeIcon.classList.remove('deactive')
            unlockIcon.style.color = 'black'
            lockIcon.style.color = 'grey'
        }
    })

    editBtn.addEventListener('click', async function () {
        await axios({
            method: 'get',
            url: `/edit/${postId}`
        }).catch(e => {
            const { msg } = e.response.data
            alert(msg)
            location.reload(true)
        })
    })

    deleteBtn.addEventListener('click', async function () {
        await axios({
            method: 'delete',
            url: `/delete/post/${postId}`
        }).then(res => {
            alert(res.data.msg)
            location.href = res.data.url
        }).catch(e => {
            const { msg } = e.response.data
            alert(msg)
            location.reload(true)
        })
    })

} else {
    topNavigation.style.display = 'none'
}


// input type text comment
commentBtn.addEventListener('click', function () {
    emoticonInput.style.display = 'none'
    commentForm.style.display = 'flex'
    commentBtn.classList.add('nav-tap-active')
    emoticonBtn.classList.remove('nav-tap-active')
})

// input type emoticon comment
emoticonBtn.addEventListener('click', async function () {
    emoticonInput.style.display = 'block'
    commentForm.style.display = 'none'
    emoticonBtn.classList.add('nav-tap-active')
    commentBtn.classList.remove('nav-tap-active')

    if (emoticonInput.dataset.load === "false") {
        await axios({
            method: "get",
            url: "/get/emoticon?value=좋았쓰"
        }).then(res => {
            for (let i = 0; i < res.data.files.length; i++) {
                const img = document.createElement('img')
                const url = res.data.location + res.data.files[i].Key
                img.src = url;
                img.classList.add('emoticon')
                emoticonContent.appendChild(img);

                // emoticon comment submit
                img.addEventListener('dblclick', async function () {
                    const formData = new FormData()
                    formData.append("postId", postId)
                    formData.append("type", 'emoticon')
                    formData.append("content", url)

                    await axios({
                        method: "post",
                        url: '/comment',
                        data: {
                            postId: postId,
                            type: 'emoticon',
                            content: url
                        }
                    }).then(res => {
                        location.reload(true)
                    }).catch(e => {
                        console.log(e)
                    })
                })
            }
            emoticonInput.dataset.load = "true"
        }).catch(e => {
            console.log(e)
        })
    }
})

commentForm.addEventListener('submit', function (e) {
    e.preventDefault()

    if (commentInput.value === '') {
        document.querySelector('.comment-input-alert').innerText = "#댓글을 입력하렴"
    } else commentForm.submit()

})

// request to server get comments
axios({
    method: "get",
    url: `/get/comment/${postId}`
}).then(res => {
    const commentList = document.querySelector('.comment-list')
    const comments = res.data

    document.querySelector('.comment-count').innerText = comments.length

    const layout = `
        <div class="comment-card">
            <div class="comment-header"></div> 
            <div class="comment-content">
        </div>`

    comments.forEach(comment => {
        commentList.insertAdjacentHTML('beforeend', layout)
        const card = commentList.lastElementChild

        card.querySelector('.comment-header').insertAdjacentHTML(
            'beforeend',
            `<div class="comment-writer">
                <i class="fa-regular fa-comment"></i>
                ${comment.username}
            </div>
            <div class="comment-date">2024-08-16</div>
            `
        )

        if (comment.authority === 'allowed') {
            card.querySelector('.comment-header').insertAdjacentHTML(
                'beforeend',
                `<button 
                    class="comment-delete-btn" 
                    data-id="${comment._id}">
                    x</button>`
            )
            card.querySelector('.comment-delete-btn').addEventListener('click', function (e) {
                axios({
                    method: "delete",
                    url: `/delete/comment/${e.target.dataset.id}`
                }).then(res => {
                    alert('삭제했다능')
                    location.reload(true)
                }).catch(err=>{
                    alert("실패라능...")
                    console.log(err)
                })
            })
        }

        if (comment.type === 'emoticon') {
            const img = document.createElement('img')
            img.src = comment.content
            img.classList.add('emoticon')
            card.querySelector('.comment-content').appendChild(img);
        } else {
            card.querySelector('.comment-content').innerText = `${comment.content}`
        }
    })

}).catch(e => {
    console.log(e)
})