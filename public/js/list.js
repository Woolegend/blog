const cardContainer = document.querySelector('.card-container')
const headerTitle = document.querySelector('.header-title')
const tags = [
    { tag: "algorithm", icon: "fa-solid fa-code", title: "Algorithm" },
    { tag: "htmlcss", icon: "fa-brands fa-html5", title: "HTML/CSS" },
    { tag: "javascript", icon: "fa-brands fa-js", title: "Javascript" },
    { tag: "nodejs", icon: "fa-brands fa-node-js", title: "Node.js" },
    { tag: "react", icon: "fa-brands fa-react", title: "React" }
]
const tag = location.pathname.match(/\/list\/(.+)/)[1]

tags.some(e => {
    if (e.tag === tag) {
        headerTitle.insertAdjacentHTML('beforeend', `
        <i class="${e.icon}"></i>
        <span>${e.title}</span>`)
    }
})

function addPostCards(posts) {
    posts.forEach(e => {
        const thumbnail = e.thumbnail || "/asset/thumbnail-placeholder-500x334.webp"
        const card = `
                <div class="card" data-id="${e._id}">
                    <img src="${thumbnail}" alt="thumbnail" width="100%">
                    <div class="card-content">
                        <h4 style="overflow:hidden; display:inline-block;width:max-content;">${e.title}</h4>
                        <p>${e.username}</p>
                        <p style="opacity: 0.5; font-weight: bold; font-size: 0.7rem;">${e.date}</p>
                    </div>
                </div>
            `
        cardContainer.insertAdjacentHTML('beforeend', card)

        const newCard = cardContainer.lastElementChild
        newCard.addEventListener('click', () => {
            const url = `/detail/${newCard.dataset.id}`
            window.location.href = url
        });
    })
}

axios({
    method: 'get',
    url: '/get/list',
    params: {
        "tag": tag
    }
}).then((res) => {
    addPostCards(res.data)
}).catch((e) => {
    console.log(e);
})