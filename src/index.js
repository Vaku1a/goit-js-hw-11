import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const elements = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

var lightbox = new SimpleLightbox('.gallery a');
let page = 1;
let searchReaquest;

elements.loadMore.classList.add('is-hidden');
elements.form.addEventListener('submit', handlerSearch);
elements.loadMore.addEventListener('click', handlerLoadMore);

async function handlerSearch(evt) {
  evt.preventDefault();
  elements.gallery.innerHTML = '';
  searchReaquest = evt.target.searchQuery.value.trim();
  try {
    const galleryObj = await fetchPixabay(searchReaquest, page);
    console.log(galleryObj);
    if (!galleryObj.hits.length) {
      return Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (searchReaquest === '') {
      return Notiflix.Notify.info('Please enter a query to search for images');
    }
    const markup = galleryMarkup(galleryObj.hits);
    elements.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
    Notiflix.Notify.success(
      `Hooray! We found totalHits: ${galleryObj.total} images`,
      {
        timeout: 3500,
      }
    );
    if (galleryObj.totalHits < 40) {
      elements.loadMore.classList.add('is-hidden');
    } else {
      elements.loadMore.classList.remove('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }

  evt.target.reset();
}

async function handlerLoadMore() {
  page += 1;
  try {
    const galleryObj = await fetchPixabay(searchReaquest, page);
    console.log(galleryObj);
    if (galleryObj.totalHits < page * 40) {
      elements.loadMore.classList.add('is-hidden');
      Notiflix.Notify.info(
        'We are sorry, but you have reached the end of search results.',
        {
          timeout: 2000,
        }
      );
    }
    const markup = galleryMarkup(galleryObj.hits);
    elements.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
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
                <b>Likes: ${likes}</b>
                </p>
                <p class="info-item">
                <b>Views: ${views}</b>
                </p>
                <p class="info-item">
                <b>Comments: ${comments}</b>
                </p>
                <p class="info-item">
                <b>Downloads: ${downloads}</b>
                </p>
            </div>
        </div>
    </a>
    `
    )
    .join('');
}
