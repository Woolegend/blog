const navbar = document.querySelector('.navbar')
const container = document.querySelector('.container')
const writeBtn = document.querySelector('.write-btn')
const userBtn = document.querySelector('#user-btn')

function focusBlur(focus, blur) {
    focus.addEventListener('mouseenter', function () {
        if (blur) {
            blur.style = `
                filter: blur(5px);
                `
        }
    })

    focus.addEventListener('mouseleave', function () {
        if (blur) {
            blur.style = `
                filter: blur(0);
                `
        }
    })
}

focusBlur(navbar, container)
focusBlur(navbar, writeBtn)

userBtn.addEventListener('click', function (e) {
    e.preventDefault()
    axios({
        method: 'get',
        url: '/user',
    }).then(res => {
        location.href = '/user'
    }).catch(e => {
        const status = e.response.status
        if (status === 401) {
            const { message, url } = e.response.data
            alert(message)
            location.href = url
        }
    })
})

writeBtn.addEventListener('click', function (e) {
    e.preventDefault()
    axios({
        method: 'get',
        url: '/write',
    }).then(res => {
        location.href = '/write'
    }).catch(e => {
        const status = e.response.status
        if (status === 401) {
            const { message, url } = e.response.data
            alert(message)
            location.href = url
        }
    })
})