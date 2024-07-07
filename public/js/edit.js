const titleInput = document.querySelector('#title')
const tagSelect = document.querySelector('#tag')

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    ['image', 'link', 'formula'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
];

const quill = new Quill('#editor', {
    debug: 'warn',
    modules: {
        toolbar: toolbarOptions,
    },
    placeholder: 'Hello World!!!',
    theme: 'snow',
});

quill.getModule('toolbar').addHandler('image', showImageDialog)

function showImageDialog() {
    const fileInput = document.createElement('input')
    fileInput.setAttribute('type', 'file')
    fileInput.setAttribute('accept', 'image/*')
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        uploadImage(file)
    })
    fileInput.click()
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file)

    await axios({
        method: "post",
        url: `/upload/image?task=edit`,
        data: formData,
    }).then((res) => {
        const { location } = res.data
        const range = quill.getSelection(true);
        quill.insertText(range.index, '\n')
        quill.insertEmbed(range.index, 'image', location)
        quill.insertText(range.index, '\n')
    }).catch((e) => {
        console.log(e)
    })
}

function checkPostFields() {
    if (titleInput.value === "") {
        alert("제목을 입력하세요")
        return false;
    } else if (tagSelect.options[tagSelect.selectedIndex].value == "") {
        alert("태그를 선택하세요")
        return false;
    } else if (quill.getLength() === 1) {
        alert("내용을 입력하세요")
        return false;
    }
    return true
}

function getInsertImages() {
    const ops = quill.getContents().ops
    let images = []

    ops.forEach(e => {
        let img = e.insert.image
        if (img !== undefined) {
            img = img.split('/')
            images[images.length] = img[img.length - 1]
        }
    })

    return images
}

axios({
    method: 'get',
    url: '/get/post',
    params: {
        "id": `${location.pathname.match(/\/edit\/(.+)/)[1]}`
    },
}).then((res) => {
    const { title, tag, delta } = res.data;

    titleInput.value = title
    quill.setContents(delta.ops)
    for (let i = 0; i < tagSelect.length; i++) {
        tagSelect[i].value == tag ?
            tagSelect[i].selected = true :
            tagSelect[i].selected = false
    }
}).catch((e) => {
    console.log(e);
})

/**
 * 게시물 저장하기
 */
async function editPost() {
    const tag = tagSelect.options[tagSelect.selectedIndex].value
    const delta = quill.getContents()
    const html = quill.root.innerHTML
    const images = getInsertImages()

    if (checkPostFields()) {
        await axios({
            method: "put",
            url: `/edit/${location.pathname.match(/\/edit\/(.+)/)[1]}`,
            data: {
                title: titleInput.value,
                tag: tag,
                delta: delta,
                html: html,
                images: images
            }
        }).then(res => {
            location.href = res.data
        }).catch((error) => {
            console.error('Error:', error);
        });
    } else return
}

document.getElementById('submit-btn').addEventListener('click', editPost)
