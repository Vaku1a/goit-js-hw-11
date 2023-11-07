import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchPixabay } from './api';

const elements = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

const options = {
  root: null,
  rootMargin: '0px',
};

const observer = new IntersectionObserver(handlerLoadMore, options);
observer.observe(elements.guard);

var lightbox = new SimpleLightbox('.gallery a');
let page = 1;
let searchReaquest = '';

elements.form.addEventListener('submit', handlerSearch);

async function handlerSearch(evt) {
  evt.preventDefault();
  elements.gallery.innerHTML = '';
  searchReaquest = evt.target.searchQuery.value.trim();

  try {
    const galleryObj = await fetchPixabay(searchReaquest);
    checkConditions(galleryObj, searchReaquest);
    createMurkup(galleryObj.hits);
    msgNotifix(`Hooray! We found totalHits: ${galleryObj.total} images`);
  } catch (error) {
    errorNotifix(error);
  }

  evt.target.reset();
}

async function handlerLoadMore(enteries, observer) {
  if (!searchReaquest) {
    return;
  }

  enteries.forEach(async entry => {
    if (entry.isIntersecting) {
      page += 1;
      try {
        const galleryObj = await fetchPixabay(searchReaquest, page);
        if (!galleryObj.hits.length) {
          msgNotifix(
            'We are sorry, but you have reached the end of search results.'
          );
          return;
        }
        createMurkup(galleryObj.hits);
      } catch (error) {
        errorNotifix(error);
      }
    }
  });
}

function createMurkup(arr) {
  elements.gallery.insertAdjacentHTML('beforeend', galleryMarkup(arr));
  lightbox.refresh();
}

function checkConditions(obj, str) {
  if (!obj.hits.length) {
    msgNotifix(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  if (str === '') {
    msgNotifix('Please enter a query to search for images');
  }
}

function msgNotifix(info) {
  return Notiflix.Notify.info(info, {
    timeout: 3500,
  });
}

function errorNotifix(info) {
  console.log(info);
  return Notiflix.Notify.failure(info, {
    timeout: 6000,
  });
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
