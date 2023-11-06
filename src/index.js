import axios from 'axios';
import Notiflix from 'notiflix';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const elements = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

let page = 1;
let searchReaquest;

elements.loadMore.classList.add('is-hidden');
elements.form.addEventListener('submit', handlerSearch);
elements.loadMore.addEventListener('click', handlerLoadMore);

async function handlerSearch(evt) {
  evt.preventDefault();
  elements.gallery.innerHTML = '';
  searchReaquest = evt.target.searchQuery.value;
  try {
    const galleryObj = await fetchPixabay(searchReaquest, page);
    if (!galleryObj.hits.length) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    const markup = galleryMarkup(galleryObj.hits);
    elements.gallery.insertAdjacentHTML('beforeend', markup);
    elements.loadMore.classList.remove('is-hidden');
  } catch (error) {
    console.log(error);
  }

  evt.target.reset();
}

async function handlerLoadMore() {
  page += 1;
  try {
    const galleryObj = await fetchPixabay(searchReaquest, page);
    if (!galleryObj.hits.length) {
      elements.loadMore.classList.add('is-hidden');
      return Notiflix.Notify.failure(
        'We are sorry, but you have reached the end of search results.'
      );
    }
    const markup = galleryMarkup(galleryObj.hits);
    elements.gallery.insertAdjacentHTML('beforeend', markup);
  } catch (error) {
    console.log(error);
  }
}

async function fetchPixabay(searchQuery, page) {
  const params = new URLSearchParams({
    key: '40494602-0a0e88287e0fb8b14fa37c335',
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });
  const response = await axios.get(`?${params}`);
  return response.data;
}

function galleryMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <a href="${largeImageURL}">
        <div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
                <p class="info-item">
                <b>${likes}</b>
                </p>
                <p class="info-item">
                <b>${views}</b>
                </p>
                <p class="info-item">
                <b>${comments}</b>
                </p>
                <p class="info-item">
                <b>${downloads}</b>
                </p>
            </div>
        </div>
    </a>
    `
    )
    .join('');
}

// fetchPixabay();
