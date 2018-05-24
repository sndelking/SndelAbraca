$get = (url, params) => {
  let paramsArray = [];
  for (key in params) paramsArray.push(`${key}=${params[key]}`);
  let getParams = paramsArray.join("&");
  return fetch(`${url}?${getParams}`, { method: "GET" })
    .then(res => res.text().then(data => JSON.parse(data)))
    .catch(err => err);
};
$post = (url, params) => {
  let paramsArray = [];
  for (key in params) paramsArray.push(`${key}=${params[key]}`);
  let getParams = paramsArray.join("&");
  return fetch(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    }),
    body: getParams
  })
    .then(res => res.text().then(data => JSON.parse(data)))
    .catch(err => err);
};
