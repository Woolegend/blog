const authority = document.querySelector('#authority').dataset.authority
const deleteBtn = document.querySelector('.delete-btn')
const editBtn = document.querySelector('.edit-btn')

if (authority === "allowed") {
    deleteBtn.addEventListener('click', async function () {
        await axios({
            method: 'delete',
            url: `/delete/post/${location.pathname.match(/\/detail\/(.+)/)[1]}`
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
    editBtn.style.display = 'none'
    deleteBtn.style.display = 'none'
}

