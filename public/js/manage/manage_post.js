const tagInputForm = document.querySelector('.tag-input-form')
const tagPreviewList = document.querySelector('.tag-preview-list')

let tags = []



tagInputForm.addEventListener('submit', function (e) {
    e.preventDefault()

    const tag = tagInputForm.querySelector('.tag')
    const icon = tagInputForm.querySelector('.icon')

    tags.push({ tag: tag.value, icon: icon.value })
    console.log(tags)

    const card = `
            <div class="tag-preview-card">
            <p>
                ${icon.value}   
                <span>${tag.value}</span>
            </p>
            <button>x</button>
            </div>    
        `

    tagPreviewList.insertAdjacentHTML('beforeend', card)
    tagPreviewList.lastElementChild.querySelector('button')
        .addEventListener('click', function (e) {
            e.target.parentElement.remove()

            for (let i = 0; i < tags.length; i++) {
                if (tags[i].tag === tag) {
                    tags.splice(i, 1);
                }
            }
        })

    tag.value = ""
    icon.value = ""
})