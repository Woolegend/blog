const deleteBtn = document.querySelector('.delete-btn')
deleteBtn.addEventListener('click', function () {
    axios({
        method: 'delete',
        url: `/delete/post/${location.pathname.match(/\/detail\/(.+)/)[1]}`
    }).then(res => {
        console.log(res)
    }).catch(e => {
        console.log(e)
        const status = e.response.status
        if (status === 401) {
            const modal = document.querySelector('.modal')
            modal.style.display = 'block'
            setTimeout(() => {
                modal.style.opacity = '1'
            }, 10)
        } else if (status === 403) {
            alert(e.response.data)
        }
    })
})