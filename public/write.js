const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    ['link', 'formula'],
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

function savePost() {
    const title = document.querySelector('#title').value
    const tag = document.querySelector('#tag')
    const selectedTag = tag.options[tag.selectedIndex].value
    const delta = quill.getContents();
    const deltaString = JSON.stringify(delta);
    const html = quill.root.innerHTML;
    
    fetch('/save-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title : title,
        tag : selectedTag,
        delta: deltaString, 
        html: html 
    })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Post saved:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  

document.getElementById('submit-btn').addEventListener('click', savePost)
