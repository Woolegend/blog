const titleInput = document.querySelector('#title')
const categoriSelect = document.querySelector('#categori')
const tagSelect = document.querySelector('#tag')

// Quill.js image custom <Start>
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
    method: 'post',
    url: `/upload/image?task=write`,
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
// Quill.js image custom <End>



// Quill.js codepen embed blot custom <Start>
const BlockEmbed = Quill.import('blots/block/embed');

class CodePenBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const id = value.split('/').pop();
    node.setAttribute('data-codepen', value);  // 전체 URL을 저장
    node.innerHTML = node.getAttribute('data-codepen')
    return node;
  }

  static value(node) {
    return node.getAttribute('data-codepen');  // 저장된 URL을 반환
  }
}

CodePenBlot.blotName = 'codepen';
CodePenBlot.className = 'codepen-blot';
CodePenBlot.tagName = 'div';

Quill.register(CodePenBlot);

// Quill.js codepen embed blot custom <End>


// Quill.js Editor Initialized <Start>
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
  ['codepen']
];

const quill = new Quill('#editor', {
  debug: 'warn',
  modules: {
    syntax: true,
    toolbar: toolbarOptions,
  },
  placeholder: 'Hello World!!!',
  theme: 'snow',
});

quill.getModule('toolbar').addHandler('image', showImageDialog)
document.querySelector('.ql-codepen').innerHTML = '<i class="fa-brands fa-codepen"></i>'
// Quill.js Editor Initialized <End>

function checkPostFields() {
  if (categoriSelect.options[categoriSelect.selectedIndex].value == "") {
    alert("카테고리를 선택하세요")
    return false;
  } else if (tagSelect.options[tagSelect.selectedIndex].value == "") {
    alert("태그를 선택하세요")
    return false;
  } else if (titleInput.value === "") {
    alert("제목을 입력하세요")
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

/**
 * 게시물 저장하기
 */
async function savePost() {
  const categori = categoriSelect.options[categoriSelect.selectedIndex].value
  const tag = tagSelect.options[tagSelect.selectedIndex].value
  const delta = quill.getContents()
  const html = quill.root.innerHTML
  const images = getInsertImages()

  if (!checkPostFields()) return

  await axios({
    method: 'post',
    url: '/write',
    data: {
      title: titleInput.value,
      categori: categori,
      tag: tag,
      delta: delta,
      html: html,
      images: images,
    }
  }).then(res => {
    location.href = res.data
  }).catch((e) => {
    const status = e.response.status
    if (status === 401) {
      const { message, url } = e.response.data
      alert(message)
      location.href = url
    }
  })
}

document.querySelector('.write-submit-btn').addEventListener('click', savePost)
