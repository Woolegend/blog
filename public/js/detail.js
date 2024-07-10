const deleteBtn = document.querySelector('.delete-btn')
deleteBtn.addEventListener('click', function () {
    axios({
        method: 'delete',
        url: `/delete/post/${location.pathname.match(/\/detail\/(.+)/)[1]}`
    }).then(res => {
        console.log(res)
    }).catch(e => {
        const status = e.response.status
        if (status === 401) {
            const { msg, url } = e.response.data
            alert(msg)
            location.href = url
        } else if (status === 403) {
            alert(e.response.data)
        }
    })
})