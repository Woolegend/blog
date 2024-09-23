const cardContainer = document.querySelector('.card-container')
const headerTitle = document.querySelector('.header-title')

const tags = [
  { tag: "algorithm", icon: "fa-solid fa-code", title: "Algorithm" },
  { tag: "htmlcss", icon: "fa-brands fa-html5", title: "HTML/CSS" },
  { tag: "javascript", icon: "fa-brands fa-js", title: "Javascript" },
  { tag: "nodejs", icon: "fa-brands fa-node-js", title: "NodeJS" },
  { tag: "react", icon: "fa-brands fa-react", title: "React" },
  { tag: "other", icon: "fa-solid fa-ellipsis", title: "Other" }
]

const urlParams = new URLSearchParams(location.search);
const tag = urlParams.get('tag');

const tagList = document.querySelector('.tag-list');
tags.forEach(e => {
  const tag = document.createElement('li');
  tag.classList.add('tag-item');

  const a = document.createElement('a');
  a.setAttribute('href', location.pathname + `?tag=${e.tag}`);
  a.classList.add('tag-link');
  a.textContent = e.title;

  const i = document.createElement('i');
  i.setAttribute('class', e.icon);

  tag.appendChild(i);
  tag.appendChild(a);
  tagList.appendChild(tag);
})



function addPostCards(posts) {
  posts.forEach(e => {
    const thumbnail = null || "/asset/thumbnail-placeholder-500x334.webp"
    
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = e._id;
    const img = document.createElement('img');
    img.src = thumbnail;
    img.classList.add('card-thumbnail');
    const main = document.createElement('div');
    main.classList.add('card-main');
    const title = document.createElement('h4');
    title.textContent = e.title;
    const author = document.createElement('p');
    author.textContent = e.username;
    const date = document.createElement('p');
    date.classList.add('card-date')
    date.textContent = e.date;

    main.append(title, author, date);
    card.append(img, main);
    
    cardContainer.appendChild(card)

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