// const BASE_URL = import.meta.env.VITE_SERVER_URL;
const BASE_URL = "https://wdd330-backend.onrender.com/"

async function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw {name: 'servicesError', message: jsosnResponse};
  }
}

export default class ExternalServices {
  constructor() {
  }
  async getData(category) {
    const response = await fetch(`${BASE_URL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }
  async findProductById(id) {
    const response = await fetch(`${BASE_URL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    return await fetch(`${BASE_URL}checkout/`, options).then(convertToJson);
  }
}
