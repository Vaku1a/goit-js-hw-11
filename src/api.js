import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

export async function fetchPixabay(searchQuery, page = 1) {
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
