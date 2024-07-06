const deleteBtn = document.querySelector('.delete-btn')
deleteBtn.addEventListener('click', function () {
    axios({
        method: 'delete',
        url: `/delete/post/${location.pathname.match(/\/detail\/(.+)/)[1]}`
    }).then(res => {
        location.href = '/list'
        console.log(res)
    }).catch(e => {
        console.log(e)
    })
})