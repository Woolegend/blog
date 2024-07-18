const emoticonForm = document.querySelector('.emoticon-form')
const emoticonInput = document.querySelector('.emoticon-input')
const previewList = document.querySelector('.preview-list')
const emoticonList = document.querySelector('.emoticon-list')

emoticonInput.addEventListener('change', function (event) {
    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(files[i]);
            img.classList.add('emoticon')
            previewList.appendChild(img);
        }
    }
})

emoticonForm.addEventListener('submit', async function (e) {
    e.preventDefault()

    const formData = new FormData()

    const title = document.querySelector('.emoticon-title').value
    const files = emoticonInput.files

    formData.append('title', title)
    for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i])
    }

    await axios({
        method: "post",
        url: '/emoticon',
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: formData
    }).then(res => {
        console.log(res)
    }).catch(e => {
        console.log(e)
    })
})

emoticonForm.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault()
    }
})

axios({
    method: "get",
    url: "/get/emoticon",
}).then(res => {
    const emoticon = res.data;
    const modal = document.querySelector('.modal')
    const layout = `
    <div class="emoticon-card">
        <div class="emoticon-header">
            <p class="emoticon-title"></p>
            <button class="delete-btn button-tag-btn">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        <div class="emoticon-content"></div>
    </div>
    `

    emoticon.forEach(e => {

        emoticonList.insertAdjacentHTML('beforeend', layout)

        const card = emoticonList.lastElementChild
        const title = card.querySelector('.emoticon-title')
        const list = card.querySelector('.emoticon-content')
        const deleteBtn = card.querySelector('delete-btn')

        title.innerText = e.title

        for (let i = 0; i < e.files.length; i++) {
            const img = document.createElement('img')
            const url = e.location + e.files[i].Key
            img.src = url;
            img.classList.add('emoticon')
            list.appendChild(img);
        }
    })

}).catch(e => {
    console.log(e)
})