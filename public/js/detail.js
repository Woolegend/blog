const authority = document.querySelector('#authority').value
const topNavigation = document.querySelector('.top-navigation')
const activeBtn = document.querySelector('.active-btn')
const activeIcon = document.querySelector('.active-btn i')
const unlockIcon = document.querySelector('.fa-unlock')
const lockIcon = document.querySelector('.fa-lock')
const deleteBtn = document.querySelector('.delete-btn')
const editBtn = document.querySelector('.edit-btn')
const postId = location.pathname.match(/\/detail\/(.+)/)[1]
let access = document.querySelector('#access').value

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

